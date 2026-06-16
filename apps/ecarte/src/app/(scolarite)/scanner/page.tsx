'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import QrScanner from '@/components/QrScanner';
import VerificationResult from '@/components/VerificationResult';
import type { VerifyResponse, VerifySuccessResponse } from '@/types/scan';

type ScanPhase = 'idle' | 'scanning' | 'verifying' | 'result';

export default function ScannerPage() {
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const handleScan = useCallback(async (decodedText: string) => {
    setPhase('verifying');
    try {
      const data = await api.post<VerifyResponse>('/card/verify', { token: decodedText });
      setResult(data);
      setPhase('result');
    } catch (err: any) {
      setError(err.message || 'QR code invalide ou falsifié');
      setPhase('result');
    }
  }, []);

  const handleError = useCallback((errMsg: string) => {
    setError(errMsg);
    setPhase('result');
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!result?.valid) return;
    const student = (result as VerifySuccessResponse).student;
    setConfirming(true);
    try {
      await api.post('/card/scan-log', { userId: student.id });
      setConfirmed(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setConfirming(false);
    }
  }, [result]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setResult(null);
    setConfirmed(false);
    setConfirming(false);
    setError('');
  }, []);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      {phase === 'idle' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="7" y1="12" x2="17" y2="12" />
            </svg>
          </div>
          <h2 className="text-white text-lg font-bold mb-1">Scanner un QR</h2>
          <p className="text-white/40 text-sm mb-6">
            Pointez la caméra vers le QR code de l'étudiant
          </p>
          <button
            onClick={() => setPhase('scanning')}
            className="bg-white/10 hover:bg-white/15 text-white text-sm px-8 py-3 rounded-xl transition-colors font-medium"
          >
            Démarrer le scan
          </button>
        </div>
      )}

      {phase === 'scanning' && (
        <QrScanner
          scanning={true}
          onScan={handleScan}
          onError={handleError}
          onStop={handleReset}
        />
      )}

      {phase === 'verifying' && (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
          <p className="text-white/50 text-sm">Vérification du QR code...</p>
        </div>
      )}

      {phase === 'result' && error && !result && (
        <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)' }}>
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-lg mb-1">QR code invalide</h2>
          <p className="text-white/50 text-sm mb-4">{error}</p>
          <button
            onClick={handleReset}
            className="bg-white/10 hover:bg-white/15 text-white text-sm px-5 py-2 rounded-xl transition-colors"
          >
            Scanner suivant
          </button>
        </div>
      )}

      {phase === 'result' && result && (
        <VerificationResult
          result={result}
          onConfirm={handleConfirm}
          onReset={handleReset}
          confirming={confirming}
          confirmed={confirmed}
        />
      )}
    </div>
  );
}
