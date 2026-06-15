'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { getDeviceFingerprint } from '@/lib/fingerprint';
import type {
  Device,
  RegisterDeviceResponse,
  MessageResponse,
} from '@/types/device';

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

// ─── Bottom Navigation (dupliqué de /card, voir note dans le code) ──────────
// NOTE: ce composant existe déjà (non exporté) dans app/card/page.tsx.
// Il est dupliqué ici pour ne pas modifier un fichier appartenant à P5.
// À factoriser dans un composant partagé si l'équipe est d'accord.

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

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="17" r="1" fill="#94a3b8" stroke="none" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
// ─── Carte d'un appareil ─────────────────────────────────────────────────────

function DeviceRow({
  device,
  onDelete,
  deleting,
}: {
  device: Device;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const createdLabel = new Date(device.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <PhoneIcon />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{device.deviceName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {device.confirmed ? (
            <span className="text-[10px] uppercase tracking-wider text-emerald-400">
              Confirmé
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-orange-400">
              En attente de confirmation
            </span>
          )}
          <span className="text-white/30 text-[10px]">· Ajouté le {createdLabel}</span>
        </div>
      </div>

      <button
        onClick={() => onDelete(device.id)}
        disabled={deleting}
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40"
        style={{ background: 'rgba(239,68,68,0.08)' }}
        aria-label="Supprimer l'appareil"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

// ─── Formulaire d'ajout (étape 1: nom, étape 2: OTP) ────────────────────────

type AddStep = 'closed' | 'name' | 'otp';

function AddDeviceFlow({
  step,
  onClose,
  onRegistered,
  onConfirmed,
}: {
  step: AddStep;
  onClose: () => void;
  onRegistered: () => void;
  onConfirmed: () => void;
}) {
  const [deviceName, setDeviceName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!deviceName.trim()) {
      setError('Veuillez donner un nom à cet appareil.');
      return;
    }

    setLoading(true);
    try {
      const fingerprint = getDeviceFingerprint();
      const res = await api.post<RegisterDeviceResponse>('/card/devices/register', {
        deviceName: deviceName.trim(),
        fingerprint,
      });
      setInfo(res.message);
      onRegistered();
    } catch (err: unknown) {
      setError(errorMessage(err, "Erreur lors de l'enregistrement."));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError("Veuillez saisir le code reçu par email.");
      return;
    }

    setLoading(true);
    try {
      const fingerprint = getDeviceFingerprint();
      await api.post<MessageResponse>('/card/devices/confirm', {
        fingerprint,
        otp: otp.trim(),
      });
      onConfirmed();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Code invalide ou expiré.'));
    } finally {
      setLoading(false);
    }
  }

  if (step === 'closed') return null;

  return (
    <div
      className="rounded-2xl p-4 mb-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.08)',
      }}
    >
      {step === 'name' && (
        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <div>
            <p className="text-white text-sm font-medium mb-1">Ajouter cet appareil</p>
            <p className="text-white/40 text-xs">
              Donnez un nom à cet appareil pour le reconnaître facilement.
            </p>
          </div>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Ex: Mon iPhone"
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)' }}
            autoFocus
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg py-2 text-sm text-white/60"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: '#102447' }}
            >
              {loading ? 'Envoi...' : 'Continuer'}
            </button>
          </div>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleConfirm} className="flex flex-col gap-3">
          <div>
            <p className="text-white text-sm font-medium mb-1">Confirmer l&apos;appareil</p>
            <p className="text-white/40 text-xs">
              {info || 'Un code a été envoyé à votre email @uca.ma.'}
            </p>
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Code reçu par email"
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none tracking-widest"
            style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)' }}
            autoFocus
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg py-2 text-sm text-white/60"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: '#102447' }}
            >
              {loading ? 'Vérification...' : 'Confirmer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
// ─── Page principale ─────────────────────────────────────────────────────────

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [error, setError] = useState('');
  const [addStep, setAddStep] = useState<AddStep>('closed');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    try {
      const data = await api.get<Device[]>('/card/devices');
      setDevices(data);
      setError('');
    } catch (err: unknown) {
      setError(errorMessage(err, 'Erreur de chargement des appareils.'));
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.delete<MessageResponse>(`/card/devices/${id}`);
      await loadDevices();
    } catch (err: unknown) {
      setError(errorMessage(err, "Erreur lors de la suppression."));
    } finally {
      setDeletingId(null);
    }
  }

  const count = devices?.length ?? 0;
  const maxReached = count >= 2;

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
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <PhoneIcon />
        </div>
        <span className="text-white/70 text-sm font-medium">Mes appareils</span>
      </header>

      <div className="px-4 max-w-sm mx-auto space-y-4">
        {/* Intro */}
        <div>
          <h1 className="text-white text-lg font-bold">Appareils enregistrés</h1>
          <p className="text-white/40 text-xs mt-1">
            Vous pouvez utiliser votre E-Carte sur {count}/2 appareil{count > 1 ? 's' : ''}.
          </p>
        </div>

        {/* Erreur globale */}
        {error && (
          <div
            className="rounded-xl p-3 text-xs text-red-400"
            style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)' }}
          >
            {error}
          </div>
        )}

        {/* Chargement */}
        {devices === null && !error && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Liste des appareils */}
        {devices !== null && (
          <div className="space-y-3">
            {devices.length === 0 ? (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-white/50 text-sm">Aucun appareil enregistré.</p>
              </div>
            ) : (
              devices.map((d) => (
                <DeviceRow
                  key={d.id}
                  device={d}
                  onDelete={handleDelete}
                  deleting={deletingId === d.id}
                />
              ))
            )}
          </div>
        )}

        {/* Flow d'ajout */}
        <AddDeviceFlow
          step={addStep}
          onClose={() => setAddStep('closed')}
          onRegistered={() => setAddStep('otp')}
          onConfirmed={() => {
            setAddStep('closed');
            loadDevices();
          }}
        />

        {/* Bouton d'ajout */}
        {addStep === 'closed' && devices !== null && (
          maxReached ? (
            <div
              className="rounded-xl p-3 text-xs text-orange-400 text-center"
              style={{ background: 'rgba(249,115,22,0.08)', border: '0.5px solid rgba(249,115,22,0.2)' }}
            >
              Maximum 2 appareils atteint — supprimez un appareil pour en ajouter un nouveau.
            </div>
          ) : (
            <button
              onClick={() => setAddStep('name')}
              className="w-full rounded-xl py-3 text-sm font-medium text-white"
              style={{ background: '#102447' }}
            >
              + Ajouter cet appareil
            </button>
          )
        )}
      </div>

      <BottomNav />
    </main>
  );
}