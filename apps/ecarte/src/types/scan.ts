// Correspond exactement au modèle Prisma ScanLog
// (champs result/rejectionReason ajoutés via migration
// 20260615165908_add_scan_result_and_rejection_reason)
export type ScanResult = 'APPROVED' | 'REJECTED';

export type RejectionReason =
  | 'PHOTO_MISMATCH'
  | 'NOT_ENROLLED'
  | 'QR_EXPIRED'
  | 'CARD_SUSPENDED'
  | 'WRONG_ESTABLISHMENT'
  | 'OTHER';

export interface VerifySuccessResponse {
  valid: true;
  student: VerifiedStudent;
}

export interface VerifyFailureResponse {
  valid: false;
  reason: 'QR_EXPIRED' | 'CARD_SUSPENDED' | 'STUDENT_NOT_FOUND';
}

export type VerifyResponse = VerifySuccessResponse | VerifyFailureResponse;

export interface VerifiedStudent {
  id: string;
  cne: string;
  apogee: string;
  filiere: string;
  etablissement: string;
  photoUrl: string | null;
  anneeInscription: string;
}

export interface ScanLogRequest {
  userId: string;
  location?: string;
}

export interface ScanLogResponse {
  id: string;
  userId: string;
  scannedBy: string;
  location: string | null;
  result: ScanResult;
  rejectionReason: RejectionReason | null;
  createdAt: string; // ISO date string (JSON)
}

// Réponse de GET /card/scans/me?page=&limit=
export interface MyScansResponse {
  data: ScanLog[];
  total: number;
  page: number;
  limit: number;
}
=======
  createdAt: string;
}

export interface ScansQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  filiere?: string;
  etablissement?: string;
}

export interface ScanLogEntry {
  id: string;
  userId: string;
  scannedBy: string;
  location: string | null;
  createdAt: string;
  user: {
    email: string;
    studentInfo: {
      cne: string;
      apogee: string;
      filiere: string;
      etablissement: string;
    } | null;
  };
}

export interface PaginatedScans {
  data: ScanLogEntry[];
  total: number;
  page: number;
  limit: number;
}
>>>>>>> 323f912602c42b01752f387a0beba1f2220d80a3
