'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import ECarteCard from '@/components/ECarteCard';
import type { StudentCard, QRToken, CardState } from '@/types/card';

// ─── Bottom Navigation ──────────────────────────────────────────────────────

function BottomNav() {
  const pathname = usePathname();
  const tabs = [
    { href: '/card',      label: 'Carte',     icon: QRIcon },
    { href: '/dashboard', label: 'Tableau',   icon: DashIcon },
    { href: '/devices',   label: 'Appareils', icon: DeviceIcon },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex border-t"
      style={{
        background: 'rgba(255,255,255,0.97)',
        borderColor: 'rgba(0,0,0,0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center py-2 gap-0.5"
          >
            <div
              className="flex items-center justify-center px-4 py-1.5 rounded-xl transition-all"
              style={
                active
                  ? { background: '#102447' }
                  : { background: 'transparent' }
              }
            >
              <Icon active={active} />
            </div>
            <span
              className="text-[10px] font-medium"
              style={{ color: active ? '#102447' : '#94a3b8' }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function QRIcon({ active }: { active: boolean }) {
  const c = active ? '#fff' : '#94a3b8';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" rx="0.5" fill={c} stroke="none" />
      <rect x="19" y="14" width="2" height="2" rx="0.5" fill={c} stroke="none" />
      <rect x="14" y="19" width="2" height="2" rx="0.5" fill={c} stroke="none" />
      <rect x="18" y="18" width="3" height="3" rx="0.5" fill={c} stroke="none" />
      <rect x="5" y="5" width="3" height="3" rx="0.5" fill={c} stroke="none" />
      <rect x="16" y="5" width="3" height="3" rx="0.5" fill={c} stroke="none" />
      <rect x="5" y="16" width="3" height="3" rx="0.5" fill={c} stroke="none" />
    </svg>
  );
}

function DashIcon({ active }: { active: boolean }) {
  const c = active ? '#fff' : '#94a3b8';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function DeviceIcon({ active }: { active: boolean }) {
  const c = active ? '#fff' : '#94a3b8';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="17" r="1" fill={c} stroke="none" />
    </svg>
  );
}

// ─── Circular Timer ──────────────────────────────────────────────────────────

function CircularTimer({
  timeLeft,
  total = 300,
  large = false,
}: {
  timeLeft: number;
  total?: number;
  large?: boolean;
}) {
  const radius = large ? 36 : 26;
  const svgSize = large ? 88 : 64;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const strokeDashoffset = circumference * (1 - progress);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const urgent = timeLeft <= 60;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center"
        style={{ width: svgSize, height: svgSize }}
      >
        <svg
          className="absolute inset-0 -rotate-90"
          width={svgSize}
          height={svgSize}
        >
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={large ? 4 : 3}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={urgent ? '#ef4444' : '#f97316'}
            strokeWidth={large ? 4 : 3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <span
          className={`font-bold font-mono tabular-nums ${large ? 'text-base' : 'text-sm'}`}
          style={{ color: urgent ? '#ef4444' : '#f97316' }}
        >
          {display}
        </span>
      </div>

      <div className="text-center">
        <p className="text-[9px] tracking-widest text-white/40 uppercase">
          Renouvellement automatique
        </p>
        <p className="text-[9px] text-white/30 mt-0.5" dir="rtl">تجديد تلقائي</p>
      </div>
    </div>
  );
}

// ─── Offline Banner ──────────────────────────────────────────────────────────

function OfflineBanner({ cachedAt }: { cachedAt?: Date }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2"
      style={{ background: '#f97316' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" strokeLinecap="round" />
      </svg>
      <div className="flex-1 min-w-0">
        <span className="text-white text-xs font-medium">
          Mode hors ligne — QR indisponible
        </span>
        <span className="text-white/70 text-xs ml-2" dir="rtl">وضع عدم الاتصال</span>
        {cachedAt && (
          <span className="text-white/60 text-[10px] block">
            Données du {cachedAt.toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── QR Zone (extracted for reuse) ──────────────────────────────────────────

function QRZone({
  cardState,
  qrToken,
  isOffline,
  timeLeft,
  large = false,
}: {
  cardState: CardState;
  qrToken: string | null;
  isOffline: boolean;
  timeLeft: number;
  large?: boolean;
}) {
  const qrSize = large ? 260 : 200;

  return (
    <div
      className="rounded-2xl overflow-hidden h-full flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.08)',
      }}
    >
      {cardState === 'active' && qrToken && !isOffline ? (
        /* Active: QR fills top, timer pinned bottom */
        <div className="flex flex-col h-full p-4 gap-4">
          {/* QR card — grows to fill all available space */}
          <div className="relative bg-white rounded-2xl p-4 flex-1 flex items-center justify-center min-h-0">
            {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
              <CornerMarker key={pos} position={pos} />
            ))}
            <QRCodeSVG
              value={qrToken}
              size={qrSize}
              level="H"
              includeMargin={false}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          {/* Timer — fixed height at bottom */}
          <div className="flex-shrink-0 flex justify-center py-2">
            <CircularTimer timeLeft={timeLeft} large={large} />
          </div>
        </div>
      ) : cardState === 'outOfHours' ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-white/70 text-sm font-medium">Hors heures</p>
          <p className="text-white/40 text-xs mt-1">Le QR est disponible de 7h à 21h uniquement.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-orange-400 text-sm font-medium">QR indisponible hors ligne</p>
          <p className="text-white/40 text-xs mt-1">Connectez-vous pour générer votre QR.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CardPage() {
  const [card, setCard] = useState<StudentCard | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [cardState, setCardState] = useState<CardState>('loading');
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState('');

  // Detect online/offline
  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    setIsOffline(!navigator.onLine);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const loadQR = useCallback(async () => {
    try {
      const data = await api.get<QRToken>('/card/qr');
      setQrToken(data.token);
      setCardState('active');
      setTimeLeft(300);
    } catch (err: any) {
      if (err.message?.includes('7h') || err.message?.includes('21h')) {
        setCardState('outOfHours');
      } else if (err.message?.includes('suspendue')) {
        setCardState('suspended');
      } else {
        setCardState('error');
        setError(err.message);
      }
    }
  }, []);

  useEffect(() => {
    async function loadCard() {
      try {
        const data = await api.get<StudentCard>('/card/me');
        setCard(data);
        if (!data.cardActive) {
          setCardState('suspended');
          return;
        }
        await loadQR();
      } catch (err: any) {
        setCardState('error');
        setError(err.message || 'Erreur de chargement');
      }
    }
    loadCard();
  }, [loadQR]);

  // Countdown + auto-refresh
  useEffect(() => {
    if (cardState !== 'active' || !qrToken) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          loadQR();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cardState, qrToken, loadQR]);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (cardState === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#0b1d3a' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Chargement de votre carte…</p>
        </div>
      </main>
    );
  }

  // ── Suspended ───────────────────────────────────────────────────────────
  if (cardState === 'suspended') {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: '#0b1d3a' }}
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-lg mb-2">Carte suspendue</h1>
          <p className="text-white/50 text-sm">
            Votre carte a été désactivée. Contactez la scolarité pour plus d'informations.
          </p>
        </div>
      </main>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (cardState === 'error') {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: '#0b1d3a' }}
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
        >
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.8">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-lg mb-2">Erreur</h1>
          <p className="text-white/50 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white/10 hover:bg-white/15 text-white text-sm px-6 py-2.5 rounded-xl transition-colors"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  // ── Main view (active | outOfHours) ────────────────────────────────────
  return (
    <main
      className="min-h-screen md:h-screen md:flex md:flex-col pb-24 "
      style={{
        background: '#0b1d3a',
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Offline banner */}
      {isOffline && <OfflineBanner />}

      {/* App header — full width on desktop, no max-w */}
      <header className="flex items-center gap-3 px-4 py-3 md:px-6 md:shrink-0">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            <line x1="12" y1="12" x2="12.01" y2="12" strokeLinecap="round" strokeWidth="2.5" />
          </svg>
        </div>
        <span className="text-white/70 text-sm font-medium">E-Carte UCA</span>
      </header>

  
      <div className="md:hidden px-4 space-y-4 max-w-sm mx-auto">
        {card && <ECarteCard card={card} />}

        <QRZone
          cardState={cardState}
          qrToken={qrToken}
          isOffline={isOffline}
          timeLeft={timeLeft}
          large={false}
        />
      </div>

      <div className="hidden md:grid md:grid-cols-2 md:gap-4 md:flex-1 md:min-h-0 px-6 pb-20">
        {/* Left: ID card — scrollable if content overflows */}
        <div className="overflow-auto">
          {card && <ECarteCard card={card} desktop />}
        </div>

        {/* Right: QR zone */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex-1 min-h-0">
            <QRZone
              cardState={cardState}
              qrToken={qrToken}
              isOffline={isOffline}
              timeLeft={timeLeft}
              large={true}
            />
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

// ─── Corner Marker ───────────────────────────────────────────────────────────

function CornerMarker({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const styles: Record<string, React.CSSProperties> = {
    tl: { top: 10, left: 10, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 4 },
    tr: { top: 10, right: 10, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 4 },
    bl: { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 4 },
    br: { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 4 },
  };

  return (
    <div
      style={{
        position: 'absolute',
        width: 16,
        height: 16,
        borderStyle: 'solid',
        borderColor: '#1e3a5f',
        borderWidth: 0,
        ...styles[position],
      }}
    />
  );
}