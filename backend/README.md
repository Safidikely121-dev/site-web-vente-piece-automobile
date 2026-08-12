# Backend AutoParts - API NestJS

API REST du site **AutoParts** (vente de pièces automobiles), construite avec **NestJS**, **TypeORM** et **SQLite**.

## Prerequisites

- Node.js 18+ (recommandé 20+)
- NPM

## Installation

```bash
npm install
```

## Configuration

Copier `.env.example` vers `.env` puis renseigner :

```
EMAIL_USER=...          # Email SMTP expéditeur
EMAIL_PASSWORD=...      # Mot de passe SMTP
ADMIN_EMAIL=...         # Destinataire des notifications admin
JWT_SECRET=...          # Clé secrète JWT
PORT=8800
CORS_ORIGIN=http://localhost:5173
AI_PROVIDER=openai|gemini
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

## Lancement

| Mode            | Commande                                          |
|-----------------|---------------------------------------------------|
| Développement   | `npm run start:dev`                               |
| Développement   | `npm run start`                                   |
| Production      | `npm run build && npm run start:prod`             |

Le serveur écoute sur `http://localhost:8800`, toutes les routes sont préfixées par `/api`.

## Base de données

- Fichier SQLite : `ventepieces.db` (créé automatiquement via `synchronize: true` — non versionné, voir `.gitignore`).
- Pour insérer les comptes de test (admins + acheteur) :

```bash
npx ts-node src/seed.ts
```

Comptes créés par le seed (mot de passe : `password123`) :

| Rôle             | Email                    |
|------------------|--------------------------|
| Admin technique  | admin@autoparts.com      |
| Admin commercial | commercial@autoparts.com |
| Acheteur (test)  | user@test.com            |

## Structure des modules

```
src/
├── auth/          # Authentification JWT, rôles, guards
├── products/      # Produits, catégories
├── orders/        # Commandes
├── demandes/      # Demandes de pièces
├── marques/       # Marques automobiles
├── notifications/ # Notifications
├── email/         # Envoi d'e-mails (Nodemailer)
├── ai/            # Chatbot IA + génération de descriptions
├── entities/      # Entités TypeORM
└── main.ts        # Bootstrap (port 8800, préfixe /api, CORS)
```

## Routage principal

| Méthode | Route                         | Accès                     |
|---------|-------------------------------|---------------------------|
| POST    | `/api/auth/login`             | Public                    |
| POST    | `/api/auth/register`          | Public                    |
| POST    | `/api/auth/admin/login`       | Public (espace admin)     |
| GET     | `/api/auth/user`              | JWT                       |
| GET     | `/api/products`               | Public                    |
| POST    | `/api/products`               | Vendeur / admin           |
| GET     | `/api/products/category/:nom` | Public                    |
| GET/POST| `/api/orders`                 | Acheteur connecté         |
| GET/POST| `/api/demandes`               | Acheteur connecté         |
| POST    | `/api/ai/chat`                | Public (chatbot)          |

## Scripts

```bash
npm run build       # Compilation TypeScript → dist/
npm run start:prod  # Lance le build compilé
npm run lint        # ESLint (avec --fix)
npm run test        # Tests unitaires (Jest)
```

## Notes

- `whitelist: true` + `forbidNonWhitelisted: true` dans `main.ts` (rejet des champs inattendus).
- Limitation de débit : 30 requêtes / 60s sur toutes les routes (`ThrottlerModule`).
- En production : désactiver `synchronize: true` et utiliser des migrations TypeORM.