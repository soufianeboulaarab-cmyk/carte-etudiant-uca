'use client';

import type { VerifySuccessResponse, VerifyFailureResponse } from '@/types/scan';

interface VerificationResultProps {
  result: VerifySuccessResponse | VerifyFailureResponse;
  onConfirm: () => void;
  onReset: () => void;
  confirming: boolean;
  confirmed: boolean;
}

export default function VerificationResult({
  result,
  onConfirm,
  onReset,
  confirming,
  confirmed,
}: VerificationResultProps) {
  if (!result.valid) {
    const messages: Record<string, { title: string; desc: string }> = {
      QR_EXPIRED: {
        title: 'QR expiré',
        desc: 'Demandez à l\'étudiant de rafraîchir son QR code.',
      },
      CARD_SUSPENDED: {
        title: 'Carte suspendue',
        desc: 'Cette carte étudiante a été désactivée.',
      },
      STUDENT_NOT_FOUND: {
        title: 'Étudiant introuvable',
        desc: 'Aucun étudiant associé à ce QR code.',
      },
    };
    const m = messages[result.reason] ?? {
      title: 'QR invalide',
      desc: 'Ce QR code n\'est pas valide.',
    };

    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)' }}>
        <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-lg mb-1">{m.title}</h2>
        <p className="text-white/50 text-sm mb-4">{m.desc}</p>
        <button
          onClick={onReset}
          className="bg-white/10 hover:bg-white/15 text-white text-sm px-5 py-2 rounded-xl transition-colors"
        >
          Scanner suivant
        </button>
      </div>
    );
  }

  const student = result.student;

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(34,197,94,0.06)', border: '0.5px solid rgba(34,197,94,0.15)' }}>
      <div className="flex items-center gap-4">
        {student.photoUrl ? (
          <img
            src={student.photoUrl}
            alt="Photo étudiant"
            className="w-20 h-20 rounded-full object-cover"
            style={{ border: '2px solid rgba(255,255,255,0.15)' }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-green-400 text-xs font-medium uppercase tracking-wider">Identité vérifiée</span>
          </div>
          <p className="text-white/40 text-xs">
            {student.etablissement} • {student.filiere}
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            {student.anneeInscription}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InfoBox label="CNE" value={student.cne} />
        <InfoBox label="Apogée" value={student.apogee} />
        <InfoBox label="Filière" value={student.filiere} />
        <InfoBox label="Établissement" value={student.etablissement} />
      </div>

      {confirmed ? (
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Scan enregistré
          </div>
          <button
            onClick={onReset}
            className="mt-3 bg-white/10 hover:bg-white/15 text-white text-sm px-5 py-2 rounded-xl transition-colors"
          >
            Scanner suivant
          </button>
        </div>
      ) : (
        <button
          onClick={onConfirm}
          disabled={confirming}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          {confirming ? 'Enregistrement...' : 'Confirmer le scan'}
        </button>
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-white/80 text-sm font-mono font-medium truncate">{value}</p>
    </div>
  );
}
