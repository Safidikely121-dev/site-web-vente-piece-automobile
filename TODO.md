# TODO - Suivi du projet AutoParts

> Ce fichier retrace les travaux déjà réalisés. Les éléments non cochés sont obsolètes ou à vérifier.

## OTP — Formulaires de connexion / inscription

**Statut : OBSOLÈTE** — La gestion OTP a été entièrement supprimée lors de la restructuration (`backend/src/auth/otp.service.ts` retiré). La connexion se fait directement par email/mot de passe, sans OTP, pour tous les rôles.

- [x] Connexion sans OTP (code actuel : `auth.service.ts → login()`)
- [x] Réservé à l'admin technique uniquement (guard `technical-admin.guard.ts`)

## Ajustement des prix des produits

**Statut : FAIT et VALIDÉ**

- [x] `frontend/src/pages/Roue.jsx` : Pneu Hiver 220 000 Ar, Jante Acier 150 000 Ar, Moyeu Arrière 130 000 Ar
- [x] `backend/create_all_tables.sql` : Pneu Michelin 800 000 Ar, Filtre à huile 150 000 Ar, Disque de frein 450 000 Ar, Biellette de direction 200 000 Ar
- [x] Validation : prix affichés correctement sur le frontend (données cohérentes `Roue.jsx` / `Commande.jsx`)

## Panier personnel par utilisateur

**Statut : FAIT**

- [x] Clé de stockage `cart_<id>` selon l'utilisateur connecté, fallback `cart_guest`
- [x] Rechargement au login/logout (`frontend/src/context/CartContext.jsx`)
- [x] Deux acheteurs ont des paniers distincts

## Autres points traités lors de la restructuration

- [x] Frontend déplacé de `frontend/auto-parts-frontend/` vers `frontend/`
- [x] Fusion pages `Categories`/`Categorierech` (voir `frontend/PLAN_FUSION.md`)
- [x] Gestion propre de l'erreur `EADDRINUSE` dans `backend/src/main.ts`
- [x] Fix 401 sur `/api/auth/user` (expulsion de session si token invalide — `AuthContext.jsx`)