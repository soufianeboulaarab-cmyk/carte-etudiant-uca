'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import type { StudentCard } from '@/types/card';
import type { MyScansResponse, ScanLog, RejectionReason } from '@/types/scan';

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

// ─── Bottom Navigation (dupliqué de /card, voir note dans /devices) ────────

function BottomNav() {
  const pathname = usePathname();
  const tabs = [
    { href: '/card', label: 'Carte', icon: QRIcon },
    { href: '/dashboard', label: 'Tableau', icon: DashIcon },
    { href: '/devices', label: 'Appareils', icon: DeviceIcon },
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
// ─── Icônes utilitaires ──────────────────────────────────────────────────────

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
      <path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Bannière offline ────────────────────────────────────────────────────────

function OfflineBanner() {
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
          Mode hors ligne — données indisponibles
        </span>
        <span className="text-white/70 text-xs ml-2" dir="rtl">وضع عدم الاتصال</span>
      </div>
    </div>
  );
}

// ─── Carte d'état (active / suspendue) ──────────────────────────────────────

function CardStatusBanner({ cardActive }: { cardActive: boolean }) {
  if (cardActive) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl p-4"
        style={{ background: 'rgba(16,185,129,0.08)', border: '0.5px solid rgba(16,185,129,0.2)' }}
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.12)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div>
          <p className="text-emerald-400 text-sm font-medium">Carte active</p>
          <p className="text-white/40 text-xs">Votre E-Carte fonctionne normalement.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-4"
      style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)' }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.12)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      </div>
      <div>
        <p className="text-red-400 text-sm font-medium">Carte suspendue</p>
        <p className="text-white/40 text-xs">Contactez la scolarité pour plus d&apos;informations.</p>
      </div>
    </div>
  );
}

const REJECTION_LABELS: Record<RejectionReason, string> = {
  PHOTO_MISMATCH: 'Photo non conforme',
  NOT_ENROLLED: 'Non inscrit',
  QR_EXPIRED: 'QR expiré',
  CARD_SUSPENDED: 'Carte suspendue',
  WRONG_ESTABLISHMENT: 'Mauvais établissement',
  OTHER: 'Autre',
};

// ─── Ligne d'historique de scan ─────────────────────────────────────────────

function ScanRow({ scan }: { scan: ScanLog }) {
  const date = new Date(scan.createdAt);
  const dateLabel = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeLabel = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const approved = scan.result === 'APPROVED';

  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: approved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}
      >
        {approved ? <CheckIcon /> : <XSmallIcon />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white text-sm font-medium">
            {approved ? 'Approuvé' : 'Rejeté'}
          </p>
          {!approved && scan.rejectionReason && (
            <span className="text-[10px] uppercase tracking-wider text-red-400">
              {REJECTION_LABELS[scan.rejectionReason]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-white/40 text-[11px]">
            {dateLabel} à {timeLabel}
          </span>
          {scan.location && (
            <span className="flex items-center gap-1 text-white/40 text-[11px]">
              <PinIcon /> {scan.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
// ─── Page principale ─────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function DashboardPage() {
  const [card, setCard] = useState<StudentCard | null>(null);
  const [scans, setScans] = useState<MyScansResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState('');

  // Détection online/offline
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

  const loadCard = useCallback(async () => {
    try {
      const data = await api.get<StudentCard>('/card/me');
      setCard(data);
    } catch (err: unknown) {
      setError(errorMessage(err, 'Erreur de chargement de la carte.'));
    }
  }, []);

  const loadScans = useCallback(async (p: number) => {
    try {
      const data = await api.get<MyScansResponse>(`/card/scans/me?page=${p}&limit=${PAGE_SIZE}`);
      setScans(data);
    } catch (err: unknown) {
      setError(errorMessage(err, "Erreur de chargement de l'historique."));
    }
  }, []);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  useEffect(() => {
    loadScans(page);
  }, [loadScans, page]);

  const totalPages = scans ? Math.max(1, Math.ceil(scans.total / scans.limit)) : 1;

  return (
    <main
      className="min-h-screen pb-24"
      style={{
        background: '#0b1d3a',
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Offline banner */}
      {isOffline && <OfflineBanner />}

      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <DashIcon active={false} />
        </div>
        <span className="text-white/70 text-sm font-medium">Tableau de bord</span>
      </header>

      <div className="px-4 max-w-sm mx-auto space-y-4">
        {/* Erreur globale */}
        {error && (
          <div
            className="rounded-xl p-3 text-xs text-red-400"
            style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)' }}
          >
            {error}
          </div>
        )}

        {/* État de la carte */}
        {card ? (
          <CardStatusBanner cardActive={card.cardActive} />
        ) : (
          !error && (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )
        )}

        {/* Historique des scans */}
        <div>
          <h1 className="text-white text-lg font-bold mb-1">Historique des vérifications</h1>
          <p className="text-white/40 text-xs mb-3">
            {scans ? `${scans.total} vérification${scans.total > 1 ? 's' : ''} au total` : 'Chargement…'}
          </p>

          {scans === null && !error ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : scans && scans.data.length === 0 ? (
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-white/50 text-sm">Aucune vérification pour le moment.</p>
            </div>
          ) : scans ? (
            <div className="space-y-3">
              {scans.data.map((scan) => (
                <ScanRow key={scan.id} scan={scan} />
              ))}
            </div>
          ) : null}

          {/* Pagination */}
          {scans && scans.total > scans.limit && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg px-3 py-1.5 text-xs text-white/70 disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                ← Précédent
              </button>
              <span className="text-white/40 text-xs">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg px-3 py-1.5 text-xs text-white/70 disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
