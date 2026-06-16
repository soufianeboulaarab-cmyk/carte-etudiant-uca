import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: any = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  emailAndPassword: { enabled: true },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'STUDENT',
        input: false,
      },
    },
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }: { email: string; otp: string }) {
        console.log(`[DEV] OTP pour ${email}: ${otp}`);
      },
      otpLength: 6,
      expiresIn: 300,
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  trustedOrigins: [
    'http://localhost:3001',
    'http://localhost:3002',
    process.env.FRONTEND_URL ?? 'http://localhost:3001',
    'http://192.168.100.13:3002',
  ],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
