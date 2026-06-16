'use client';

import Link from 'next/link';

export default function ScolariteDashboard() {
  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-white text-xl font-bold">Scolarité</h1>
        <p className="text-white/40 text-sm mt-1">Gestion des cartes étudiantes</p>
      </div>

      <Link
        href="/scanner"
        className="block rounded-2xl p-5 transition-all hover:translate-y-[-2px]"
        style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(59,130,246,0.1)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="7" y1="12" x2="17" y2="12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-base">Scanner un QR</h2>
            <p className="text-white/40 text-xs mt-0.5">Vérifier l'identité d'un étudiant</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </Link>

      <Link
        href="/scans"
        className="block rounded-2xl p-5 transition-all hover:translate-y-[-2px]"
        style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139,92,246,0.1)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-base">Historique des scans</h2>
            <p className="text-white/40 text-xs mt-0.5">Consulter l'historique des vérifications</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
