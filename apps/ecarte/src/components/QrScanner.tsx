'use client';

import { useEffect, useRef, useState } from 'react';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  onError: (error: string) => void;
  scanning: boolean;
  onStop: () => void;
}

export default function QrScanner({ onScan, onError, scanning, onStop }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [camIndex, setCamIndex] = useState(0);

  useEffect(() => {
    if (!scanning || !containerRef.current) return;
    if (scannerRef.current) return;

    let stopped = false;

    import('html5-qrcode').then(async ({ Html5Qrcode }) => {
      if (stopped || scannerRef.current) return;
      const devices = await Html5Qrcode.getCameras().catch(() => []);
      const rear = devices.filter(d =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('environment')
      );
      const sorted = rear.length ? rear : devices;
      setCameras(sorted);

      const qr = new Html5Qrcode('qr-reader');
      scannerRef.current = qr;

      const camId = sorted[camIndex]?.id;
      qr.start(
        camId ? { deviceId: { exact: camId } } : { facingMode: 'environment' },
        { fps: 15 },
        (decodedText: string) => { onScan(decodedText); },
        () => {},
      ).then(() => {
        if (stopped) { qr.stop().catch(() => {}); return; }
        setCameraReady(true);
      }).catch((err: any) => {
        if (!stopped) onError(err?.message || 'Erreur d\'accès à la caméra');
      });
    });

    return () => {
      stopped = true;
      const qr = scannerRef.current;
      scannerRef.current = null;
      if (qr?.isScanning) qr.stop().catch(() => {});
    };
  }, [scanning, onScan, onError, camIndex]);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (!scanning) return null;

  return (
    <div className="relative" style={{ background: '#000', minHeight: 300 }}>
      <div id="qr-reader" ref={containerRef} />
      {!cameraReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white/60 text-xs">Activation de la caméra...</p>
          </div>
        </div>
      )}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        {cameras.length > 1 && (
          <button
            onClick={() => { scannerRef.current?.stop().catch(() => {}); scannerRef.current = null; setCamIndex(i => (i + 1) % cameras.length); setCameraReady(false); }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <polygon points="1 1 6 1 6 6" /><polygon points="23 1 18 1 18 6" />
              <polygon points="1 23 6 23 6 18" /><polygon points="23 23 18 23 18 18" />
              <line x1="12" y1="6" x2="12" y2="18" /><line x1="6" y1="12" x2="18" y2="12" />
            </svg>
          </button>
        )}
        <button
          onClick={onStop}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `#qr-shaded-region{display:none!important}`
      }} />
    </div>
  );
}
