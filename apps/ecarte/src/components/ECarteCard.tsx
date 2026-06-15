'use client';

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
    user: { name: string; email: string };
  };
  desktop?: boolean;
}

export default function ECarteCard({ card, desktop = false }: ECarteCardProps) {
  const logoUrl = ETABLISSEMENT_LOGOS[card.etablissement] ?? null;

  return (
    <div
      className="relative rounded-2xl overflow-hidden select-none h-full flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #0b1d3a 0%, #142850 50%, #0b1d3a 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }}
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Suspended overlay */}
      {!card.cardActive && (
        <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="text-4xl mb-2">🚫</div>
            <p className="text-red-400 font-bold text-sm tracking-widest uppercase">Carte suspendue</p>
          </div>
        </div>
      )}

      {/* ── TOP: header (logo + établissement) ── */}
      <div className={`relative flex items-center justify-between px-4 pt-4 pb-2 ${desktop ? 'md:px-6 md:pt-5' : ''}`}>
        <div
          className={`rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 ${desktop ? 'w-12 h-12 md:w-14 md:h-14' : 'w-12 h-12'}`}
          style={{ background: 'rgba(255,255,255,0.10)', border: '0.5px solid rgba(255,255,255,0.18)' }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={card.etablissement} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-white/40 font-bold text-xs text-center leading-tight px-1">UCA</span>
          )}
        </div>
        <div className="text-right ml-3">
          <p className={`text-white font-bold tracking-widest leading-tight ${desktop ? 'text-sm md:text-base' : 'text-xs'}`}>
            {card.etablissement}
          </p>
          <p className={`text-white/40 tracking-wider mt-0.5 uppercase ${desktop ? 'text-[9px] md:text-[10px]' : 'text-[9px]'}`}>
            Université Cadi Ayyad
          </p>
        </div>
      </div>

      {/* ── MIDDLE: photo + name + IDs — grows to fill space ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-2 gap-3">
        {/* Photo */}
        {card.photoUrl ? (
          <img
            src={card.photoUrl}
            alt="Photo étudiant"
            className={`rounded-full object-cover ${desktop ? 'w-28 h-28 md:w-36 md:h-36' : 'w-24 h-24'}`}
            style={{ border: '2.5px solid rgba(255,255,255,0.25)' }}
          />
        ) : (
          <div
            className={`rounded-full flex items-center justify-center ${desktop ? 'w-28 h-28 md:w-36 md:h-36' : 'w-24 h-24'}`}
            style={{ background: 'rgba(255,255,255,0.08)', border: '2.5px solid rgba(255,255,255,0.18)' }}
          >
            <svg width={desktop ? 52 : 40} height={desktop ? 52 : 40} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}

        {/* Name */}
        <div className="text-center">
          <p className={`text-white font-bold tracking-wide leading-tight ${desktop ? 'text-xl md:text-2xl' : 'text-xl'}`}>
            {card.user.name}
          </p>
          <p className={`text-white/50 mt-0.5 ${desktop ? 'text-xs md:text-sm' : 'text-xs'}`}>
            {card.user.email}
          </p>
          <p className="text-white/50 text-sm mt-0.5" dir="rtl" style={{ fontFamily: 'Arial, sans-serif' }}>
            &#x200F;
          </p>
        </div>

        {/* CNE + Apogée */}
        <div className="flex gap-3 w-full">
          <IDPill label="CNE" value={card.cne} desktop={desktop} />
          <IDPill label="APOGÉE" value={card.apogee} desktop={desktop} />
        </div>
      </div>

      {/* ── BOTTOM: filière + année ── */}
      <div className={`relative text-center px-4 pb-4 ${desktop ? 'md:px-6 md:pb-5' : ''}`}>
        <p className={`text-white/40 tracking-widest uppercase ${desktop ? 'text-[9px] md:text-[10px]' : 'text-[9px]'}`}>
          FILIÈRE <span className="mx-1">/</span> <span dir="rtl">الشعبة</span>
        </p>
        <p className={`text-white font-semibold mt-1 ${desktop ? 'text-sm md:text-base' : 'text-sm'}`}>
          {card.filiere}
        </p>

        <p className={`text-white/30 tracking-widest uppercase mt-3 ${desktop ? 'text-[9px] md:text-[10px]' : 'text-[9px]'}`}>
          ANNÉE UNIVERSITAIRE
        </p>
        <p className={`text-white/70 font-medium mt-0.5 ${desktop ? 'text-xs md:text-sm' : 'text-xs'}`}>
          {card.anneeInscription}
        </p>
        <p className="text-white/50 text-sm mt-0.5" dir="rtl" style={{ fontFamily: 'Arial, sans-serif' }}>
            &#x200F;
          </p>
      </div>

      {/* Security strip */}
      <div
        className="h-1 w-full flex-shrink-0"
        style={{
          background: 'repeating-linear-gradient(90deg, #1a3461 0px, #1a3461 8px, #0b1d3a 8px, #0b1d3a 16px)',
          opacity: 0.6,
        }}
      />
    </div>
  );
}

function IDPill({ label, value, desktop = false }: { label: string; value: string; desktop?: boolean }) {
  return (
    <div
      className="flex-1 rounded-lg px-3 py-2 text-center"
      style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)' }}
    >
      <p className={`text-white/40 tracking-widest uppercase ${desktop ? 'text-[9px] md:text-[10px]' : 'text-[8px]'}`}>
        {label}
      </p>
      <p className={`text-white font-semibold mt-0.5 font-mono ${desktop ? 'text-sm md:text-base' : 'text-sm'}`}>
        {value}
      </p>
    </div>
  );
}