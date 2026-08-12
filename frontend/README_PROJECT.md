# README_PROJECT.md

> Ce fichier sert de note interne d'avancement du projet. Le **README officiel** se trouve à la racine du dépôt (`README.md`) et le guide backend dans `backend/README.md`.

## État du projet (12/08/2026)

- ✅ Frontend : React 19 + Vite, restructuré dans `frontend/` (déplacé depuis `frontend/auto-parts-frontend/`)
- ✅ Backend : NestJS + TypeORM + SQLite, tous les modules en place (auth, produits, commandes, demandes, marques, notifications, e-mail, IA)
- ✅ Authentification JWT avec rôles (admin_technique, admin_commercial, vendeur, acheteur)
- ✅ Fusion des pages `Categories` / `Categorierech` (voir `PLAN_FUSION.md`)
- ✅ Panier personnel par utilisateur (voir `frontend/TODO.md`)
- ✅ Prix réalistes en Ariary (voir `TODO.md`)
- ✅ Build frontend OK, compilation backend OK, ESLint configuré des deux côtés
- ✅ Correction de la déconnexion automatique sur token invalide (401 → `setUser(null)`)

## Comptes par défaut (via `backend/src/seed.ts`)

| Rôle             | Email                    | Mot de passe  |
|------------------|--------------------------|---------------|
| Admin technique  | admin@autoparts.com      | password123   |
| Admin commercial | commercial@autoparts.com | password123   |
| Acheteur (test)  | user@test.com            | password123   |

## Notes de production

- En production, désactiver `synchronize: true` dans `backend/src/app.module.ts` et utiliser des migrations.
- Le `ventepieces.db` est généré automatiquement et n'est pas versionné (ignoré par `.gitignore`).