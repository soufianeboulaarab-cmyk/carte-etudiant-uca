import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { auth } from '../auth/auth';
import { importPKCS8, importSPKI, SignJWT, jwtVerify } from 'jose';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  RegisterDeviceDto,
  ConfirmDeviceDto,
  ScanLogDto,
  ScansQueryDto,
  MyScansQueryDto,
} from './dto/card.dto';

@Injectable()
export class CardService {
  private privateKey: Promise<CryptoKey>;
  private publicKey: Promise<CryptoKey>;

  constructor(
    private prisma: PrismaService,
    private r2: R2Service,
  ) {
    const priv = readFileSync(join(process.cwd(), 'keys', 'private.pem'), 'utf8');
    const pub = readFileSync(join(process.cwd(), 'keys', 'public.pem'), 'utf8');
    this.privateKey = importPKCS8(priv, 'RS256');
    this.publicKey = importSPKI(pub, 'RS256');
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private getAnneeInscription(): string {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    return month >= 9 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
  }

  private isWithinAllowedHours(): boolean {
    const now = new Date();
    const moroccoHour = new Date(
      now.toLocaleString('en-US', { timeZone: 'Africa/Casablanca' }),
    ).getHours();
    return moroccoHour >= 7 && moroccoHour < 21;
  }

  // ─── GET /card/me ──────────────────────────────────────────────────────────

  async getMyCard(userId: string) {
    const student = await this.prisma.studentInfo.findUnique({
      where: { userId },
      include: { user: { select: { email: true, name: true, role: true } } },
    });
    if (!student) throw new NotFoundException('Carte introuvable');
    return { ...student, anneeInscription: this.getAnneeInscription() };
  }

  // ─── GET /card/qr ──────────────────────────────────────────────────────────

  async getQrToken(userId: string): Promise<{ token: string }> {
    if (!this.isWithinAllowedHours())
      throw new ForbiddenException('QR disponible uniquement entre 7h et 21h');

    const student = await this.prisma.studentInfo.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Étudiant introuvable');
    if (!student.cardActive) throw new ForbiddenException('Carte suspendue');

    const key = await this.privateKey;
    const token = await new SignJWT({ studentId: userId, cne: student.cne, apogee: student.apogee })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(key);

    return { token };
  }

  // ─── GET /card/scans/me ────────────────────────────────────────────────────

  async getMyScans(userId: string, query: MyScansQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.scanLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      this.prisma.scanLog.count({ where: { userId } }),
    ]);
    return { data, total, page, limit };
  }

  // ─── GET /card/devices ─────────────────────────────────────────────────────

  async getDevices(userId: string) {
    return this.prisma.device.findMany({
      where: { userId },
      select: { id: true, deviceName: true, fingerprint: true, confirmed: true, createdAt: true },
    });
  }

  // ─── POST /card/devices/register ──────────────────────────────────────────

  async registerDevice(userId: string, email: string, dto: RegisterDeviceDto) {
    const count = await this.prisma.device.count({ where: { userId } });
    if (count >= 2) throw new BadRequestException('Maximum 2 appareils atteint');

    const existing = await this.prisma.device.findUnique({ where: { fingerprint: dto.fingerprint } });
    if (existing) throw new BadRequestException('Appareil déjà enregistré');

    const device = await this.prisma.device.create({
      data: { userId, deviceName: dto.deviceName, fingerprint: dto.fingerprint },
    });

    // Envoi OTP via BetterAuth emailOTP plugin
    await auth.api.sendVerificationOTP({
      body: { email, type: 'email-verification' },
    });

    return { deviceId: device.id, message: 'OTP envoyé à ' + email };
  }

  // ─── POST /card/devices/confirm ────────────────────────────────────────────

  async confirmDevice(userId: string, email: string, dto: ConfirmDeviceDto, token: string) {
    const device = await this.prisma.device.findFirst({
      where: { userId, fingerprint: dto.fingerprint },
    });
    if (!device) throw new NotFoundException('Appareil introuvable');

    const result = await auth.api.verifyEmailOTP({
      body: { email, otp: dto.otp, type: 'email-verification' },
      headers: new Headers({ 'authorization': `Bearer ${token}` }),
    });

    if (!result) throw new UnauthorizedException('OTP invalide ou expiré');

    await this.prisma.device.update({ where: { id: device.id }, data: { confirmed: true } });
    return { message: 'Appareil confirmé' };
  }

  // ─── DELETE /card/devices/:id ──────────────────────────────────────────────

  async deleteDevice(userId: string, deviceId: string) {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) throw new NotFoundException('Appareil introuvable');
    if (device.userId !== userId) throw new ForbiddenException('Non autorisé');
    await this.prisma.device.delete({ where: { id: deviceId } });
    return { message: 'Appareil supprimé' };
  }

  // ─── POST /card/verify (SCOLARITE) ────────────────────────────────────────

  async verifyCard(token: string) {
    try {
      const key = await this.publicKey;
      const { payload } = await jwtVerify(token, key, { algorithms: ['RS256'] });

      const student = await this.prisma.studentInfo.findUnique({
        where: { userId: payload.studentId as string },
        include: { user: { select: { email: true } } },
      });

      if (!student) return { valid: false, reason: 'STUDENT_NOT_FOUND' };
      if (!student.cardActive) return { valid: false, reason: 'CARD_SUSPENDED' };

      return {
        valid: true,
        student: {
          id: student.userId,
          cne: student.cne,
          apogee: student.apogee,
          filiere: student.filiere,
          etablissement: student.etablissement,
          photoUrl: student.photoUrl,
          anneeInscription: this.getAnneeInscription(),
        },
      };
    } catch (err: any) {
      if (err?.code === 'ERR_JWT_EXPIRED') return { valid: false, reason: 'QR_EXPIRED' };
      throw new UnauthorizedException('Token JWT invalide');
    }
  }

  // ─── POST /card/scan-log (SCOLARITE) ──────────────────────────────────────

  async createScanLog(scannedBy: string, dto: ScanLogDto) {
      const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
      if (!user) throw new NotFoundException('Étudiant introuvable');
      return this.prisma.scanLog.create({
        data: {
          userId: dto.userId,
          scannedBy,
          location: dto.location,
          result: dto.result,
          rejectionReason: dto.rejectionReason,
        },
      });
    }

  // ─── GET /card/scans (SCOLARITE) ──────────────────────────────────────────

  async getAllScans(query: ScansQueryDto) {
    const { page = 1, limit = 20, search, filiere, etablissement } = query;
    const skip = (page - 1) * limit;

    const studentWhere: any = {};
    if (filiere) studentWhere.filiere = { contains: filiere, mode: 'insensitive' };
    if (etablissement) studentWhere.etablissement = { contains: etablissement, mode: 'insensitive' };

    const userWhere: any = {};
    if (search) {
      userWhere.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { studentInfo: { cne: { contains: search, mode: 'insensitive' } } },
        { studentInfo: { apogee: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const where: any = {
      user: { ...userWhere, studentInfo: Object.keys(studentWhere).length ? studentWhere : undefined },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.scanLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              email: true,
              studentInfo: { select: { cne: true, apogee: true, filiere: true, etablissement: true } },
            },
          },
        },
      }),
      this.prisma.scanLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // ─── POST /card/photo/:userId (SCOLARITE) ─────────────────────────────────

  async uploadPhoto(userId: string, buffer: Buffer, mimeType: string) {
    const student = await this.prisma.studentInfo.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Étudiant introuvable');
    const url = await this.r2.uploadPhoto(userId, buffer, mimeType);
    await this.prisma.studentInfo.update({ where: { userId }, data: { photoUrl: url } });
    return { photoUrl: url };
  }
}
