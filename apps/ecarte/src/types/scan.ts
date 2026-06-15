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

export interface ScanLog {
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