'use client';

// Mapping établissement → logo (à compléter selon vos assets)
const ETABLISSEMENT_LOGOS: Record<string, string> = {
  'ENSA MARRAKECH': '/logos/ensa.png',
  'FSSM': '/logos/fssm.png',
  'FST': '/logos/fst.png',
  'ENCG': '/logos/encg.png',
  'FPL': '/logos/fpl.png',
};

interface ECarteCardProps {
  card: {
    cne: string;
    apogee: string;
    filiere: string;
    etablissement: string;
    photoUrl: string | null;
    anneeInscription: string;
    cardActive: boolean;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function ECarteCard({ card }: ECarteCardProps) {
  const logoUrl = ETABLISSEMENT_LOGOS[card.etablissement] ?? null;

  return (
    <div
      className="relative rounded-2xl overflow-hidden select-none"
      style={{
        background: 'linear-gradient(160deg, #0b1d3a 0%, #142850 50%, #0b1d3a 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }}
    >
      {/* Dot-grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Card suspended overlay */}
      {!card.cardActive && (
        <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="text-4xl mb-2">🚫</div>
            <p className="text-red-400 font-bold text-sm tracking-widest uppercase">
              Carte suspendue
            </p>
          </div>
        </div>
      )}

      {/* Header: logo + établissement */}
      <div className="relative flex items-start justify-between px-4 pt-4 pb-2">
        {/* Logo bloc */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.10)', border: '0.5px solid rgba(255,255,255,0.18)' }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={card.etablissement} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-xs text-white/40 font-bold text-center leading-tight px-1">UCA</span>
          )}
        </div>

        {/* Établissement */}
        <div className="text-right ml-3">
          <p className="text-white font-bold text-xs tracking-widest leading-tight">
            {card.etablissement}
          </p>
          <p className="text-white/40 text-[9px] tracking-wider mt-0.5 uppercase">
            Université Cadi Ayyad
          </p>
        </div>
      </div>

      {/* Photo */}
      <div className="flex justify-center mt-2 mb-3">
        <div className="relative">
          {card.photoUrl ? (
            <img
              src={card.photoUrl}
              alt="Photo étudiant"
              className="w-24 h-24 rounded-full object-cover"
              style={{ border: '2.5px solid rgba(255,255,255,0.25)' }}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '2.5px solid rgba(255,255,255,0.18)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Nom étudiant */}
      <div className="text-center px-4">
        <p className="text-white font-bold text-xl tracking-wide leading-tight">
          {card.user.name}
        </p>
        {/* Translittération arabe du nom — si disponible, sinon placeholder */}
        <p className="text-white/50 text-sm mt-1" dir="rtl" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Idéalement: card.nameAr */}
          &#x200F;
        </p>
      </div>

      {/* CNE + Apogée */}
      <div className="flex gap-3 mx-4 mt-3">
        <IDPill label="CNE" value={card.cne} />
        <IDPill label="APOGÉE" value={card.apogee} />
      </div>

      {/* Filière */}
      <div className="text-center mt-4 px-4">
        <p className="text-white/40 text-[9px] tracking-widest uppercase">
          FILIÈRE <span className="mx-1">/</span> <span dir="rtl">الشعبة</span>
        </p>
        <p className="text-white font-semibold text-sm mt-1">{card.filiere}</p>
      </div>

      {/* Année universitaire */}
      <div className="text-center mt-3 pb-5 px-4">
        <p className="text-white/30 text-[9px] tracking-widest uppercase">
          ANNÉE UNIVERSITAIRE
        </p>
        <p className="text-white/70 text-xs font-medium mt-1">{card.anneeInscription}</p>
      </div>

      {/* Bande de sécurité en bas */}
      <div
        className="h-1 w-full"
        style={{
          background:
            'repeating-linear-gradient(90deg, #1a3461 0px, #1a3461 8px, #0b1d3a 8px, #0b1d3a 16px)',
          opacity: 0.6,
        }}
      />
    </div>
  );
}

function IDPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex-1 rounded-lg px-3 py-2 text-center"
      style={{
        background: 'rgba(255,255,255,0.07)',
        border: '0.5px solid rgba(255,255,255,0.12)',
      }}
    >
      <p className="text-white/40 text-[8px] tracking-widest uppercase">{label}</p>
      <p className="text-white font-semibold text-sm mt-0.5 font-mono">{value}</p>
    </div>
  );
}