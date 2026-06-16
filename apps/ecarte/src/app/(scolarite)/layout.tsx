'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api, getToken } from '@/lib/api';

function NavIcon({ active, label }: { active: boolean; label: string }) {
  const c = active ? '#fff' : '#94a3b8';
  const icons: Record<string, React.ReactNode> = {
    Accueil: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    Scanner: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <line x1="7" y1="12" x2="17" y2="12" />
      </svg>
    ),
    Historique: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  };
  return icons[label] ?? null;
}

function ScolariteNav() {
  const pathname = usePathname();
  const tabs = [
    { href: '/', label: 'Accueil' },
    { href: '/scanner', label: 'Scanner' },
    { href: '/scans', label: 'Historique' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: 'rgba(16,36,71,0.97)',
        borderColor: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center min-w-0 gap-0.5"
              style={{ padding: '6px 4px 4px' }}
            >
              <div
                className="flex items-center justify-center rounded-xl transition-all min-w-0"
                style={{ padding: active ? '6px 12px' : '6px 12px', background: active ? 'rgba(255,255,255,0.12)' : 'transparent' }}
              >
                <NavIcon active={active} label={label} />
              </div>
              <span
                className="text-[10px] font-medium truncate max-w-full leading-none"
                style={{ color: active ? '#fff' : 'rgba(255,255,255,0.4)' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function ScolariteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'authorized' | 'forbidden'>('loading');

  useEffect(() => {
    async function checkSession() {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        await api.get('/card/scans?limit=1');
        setState('authorized');
      } catch (err) {
        if (err instanceof Error && err.message.includes('Rôle insuffisant')) {
          setState('forbidden');
        } else {
          router.push('/login');
        }
      }
    }
    checkSession();
  }, [router]);

  if (state === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#0b1d3a' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/50 text-sm">Vérification de session...</p>
        </div>
      </main>
    );
  }

  if (state === 'forbidden') {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#0b1d3a' }}>
        <div
          className="w-full max-w-sm rounded-2xl p-8 text-center mx-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)' }}
        >
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-lg mb-2">Accès réservé</h1>
          <p className="text-white/50 text-sm">Cette section est réservée à la scolarité.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24" style={{ background: '#0b1d3a' }}>
      <header className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="text-white/70 text-sm font-medium">Scolarité — E-Carte UCA</span>
      </header>
      {children}
      <ScolariteNav />
    </main>
  );
}
