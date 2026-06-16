# P4 — Scanner & Dashboard Scolarité

## Problèmes résolus

| Problème | Cause | Fix |
|---|---|---|
| **Bande blanche en dézoom mobile** | `<body>` background blanc par défaut | `globals.css` : `body { background: #0b1d3a; overflow-x: hidden; }` + `html { overflow-x: hidden; }` |
| **Nav bar déborde horizontalement** | Padding `px-4` trop large, pas de `min-w-0`/`truncate` | Layout nav compacté (`padding: 6px 4px`), `max-w-lg mx-auto` centré, `truncate` + `min-w-0` + `leading-none` |
| **Historique illisible sur mobile (tableau 7 colonnes)** | `<table>` non responsive | Cards en `grid-cols-2` sur mobile (`md:hidden`), tableau conservé desktop (`hidden md:block`) |
| **Scanner html5-qrcode "Cannot transition to new state"** | Race condition React (effet déclenché plusieurs fois) | Guard `if (scannerRef.current) return` + `stopped` flag dans le cleanup |
| **Scanner ne fonctionne pas dans la page scanner** | Caméra non détectée, mauvaise sélection de caméra | Switch caméra via `deviceId`, fps 15, suppression `#qr-shaded-region` en CSS |

## Fichiers modifiés

```
apps/api/src/auth/auth.ts                        + trustedOrigin 192.168.100.13:3002
apps/api/src/main.ts                             + CORS 192.168.100.13:3002
apps/ecarte/next.config.ts                       + allowedDevOrigins
apps/ecarte/src/app/(scolarite)/layout.tsx       Nav responsive + pb-24
apps/ecarte/src/app/(scolarite)/scans/page.tsx   Cards mobile + Cell component
apps/ecarte/src/app/card/page.tsx                QR size 250/300px
apps/ecarte/src/app/globals.css                  body bg + overflow-x:hidden
apps/ecarte/src/components/QrScanner.tsx         Switch caméra, déduplication, cache overlay
```

## Fichiers créés

```
apps/ecarte/src/app/(scolarite)/layout.tsx       Layout session check + nav mobile 3 tabs
apps/ecarte/src/app/(scolarite)/page.tsx         Dashboard 2 cartes action
apps/ecarte/src/app/(scolarite)/scanner/page.tsx Scanner phases idle→scanning→verifying→result
apps/ecarte/src/app/(scolarite)/scans/page.tsx   Historique paginé (tableau + cards mobile)
apps/ecarte/src/components/QrScanner.tsx         Wrapper html5-qrcode avec switch caméra
apps/ecarte/src/components/VerificationResult.tsx Résultat vérification + bouton Confirmer
apps/ecarte/src/types/scan.ts                    Types VerifyResponse, PaginatedScans, etc.
```

## Commandes utiles

```bash
# Démarrer l'API (port 3000)
cd apps/api && npm run start:dev

# Démarrer le frontend (port 3002)
cd apps/ecarte && npm run dev

# Build frontend
cd apps/ecarte && npm run build

# Tuer le processus si port 3000 occupé
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Redémarrer l'API après changement de .env
# (NestJS ne hot-reload pas le .env — arrêter et relancer)
```

## Tester sur mobile

1. Même réseau Wi-Fi que le PC
2. Dans `apps/ecarte/.env.local` :
   ```
   NEXT_PUBLIC_API_URL=http://<IP_DU_PC>:3000
   ```
3. Chrome Android → `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
   → Ajouter `http://<IP_DU_PC>:3002`
4. Accéder à `http://<IP_DU_PC>:3002`
5. Compte test : `scolarite@uca.ma` (rôle SCOLARITE)

## Notes importantes

- P3 ne retourne PAS `name` ou `email` dans `/card/verify` — seulement `cne`, `apogee`, `filiere`, `etablissement`, `photoUrl`, `anneeInscription`
- `ScanLog` n'a PAS de champ `result`/`rejectionReason` — juste `userId`, `scannedBy`, `location?`, `createdAt`
- Le rôle `ADMIN` ne donne pas accès aux endpoints scolarité — seul `SCOLARITE` fonctionne
- BetterAuth `get-session` ne fonctionne PAS avec le token Bearer — nécessite des cookies
- Le QR encode un JWT RS256 (5min) avec `studentId`, `cne`, `apogee`
- Fenêtre horaire QR étendue à 0h-24h en dev
