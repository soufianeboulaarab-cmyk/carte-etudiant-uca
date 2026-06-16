'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { PaginatedScans } from '@/types/scan';

export default function ScansPage() {
  const [data, setData] = useState<PaginatedScans | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filiere, setFiliere] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchScans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (filiere) params.set('filiere', filiere);
      if (etablissement) params.set('etablissement', etablissement);
      const res = await api.get<PaginatedScans>(`/card/scans?${params}`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, filiere, etablissement]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="px-4 py-4 max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher par email, CNE ou Apogée"
          className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
          style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={filiere}
            onChange={(e) => { setFiliere(e.target.value); setPage(1); }}
            placeholder="Filière"
            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
          />
          <input
            type="text"
            value={etablissement}
            onChange={(e) => { setEtablissement(e.target.value); setPage(1); }}
            placeholder="Établissement"
            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/30 text-sm">Aucun scan trouvé</p>
        </div>
      ) : (
        <>
          {/* Mobile: card layout */}
          <div className="md:hidden space-y-3">
            {data.data.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl p-4 space-y-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-[10px] uppercase tracking-wider">
                    {new Date(entry.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-white/20 text-[10px]">{entry.location ?? '—'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Cell label="Email" value={entry.user.email} mono />
                  <Cell label="CNE" value={entry.user.studentInfo?.cne ?? '—'} mono />
                  <Cell label="Apogée" value={entry.user.studentInfo?.apogee ?? '—'} mono />
                  <Cell label="Filière" value={entry.user.studentInfo?.filiere ?? '—'} />
                  <Cell label="Établissement" value={entry.user.studentInfo?.etablissement ?? '—'} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table layout */}
          <div className="hidden md:block overflow-x-auto rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <Th>Date</Th>
                  <Th>Email</Th>
                  <Th>CNE</Th>
                  <Th>Apogée</Th>
                  <Th>Filière</Th>
                  <Th>Établissement</Th>
                  <Th>Lieu</Th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <Td>{new Date(entry.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Td>
                    <Td className="font-mono text-xs">{entry.user.email}</Td>
                    <Td>{entry.user.studentInfo?.cne ?? '—'}</Td>
                    <Td>{entry.user.studentInfo?.apogee ?? '—'}</Td>
                    <Td>{entry.user.studentInfo?.filiere ?? '—'}</Td>
                    <Td>{entry.user.studentInfo?.etablissement ?? '—'}</Td>
                    <Td>{entry.location ?? '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl text-sm disabled:opacity-30 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}
              >
                Précédent
              </button>
              <span className="text-white/40 text-xs">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl text-sm disabled:opacity-30 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Cell({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-white/30 text-[10px] uppercase tracking-wider">{label}</p>
      <p className={`text-white/80 text-xs mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-white/40 text-[10px] uppercase tracking-wider font-medium">
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3 text-white/70 text-xs ${className}`}>
      {children}
    </td>
  );
}
