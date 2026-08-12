# AGENTS.md - Auto Parts Store (Pièces Automobiles)

## Project Overview
- **Backend**: NestJS + TypeORM + SQLite (port 8800)
- **Frontend**: React 19 + Vite (port 5173, proxies `/api` → backend)
- **Database**: `ventepieces.db` (SQLite, auto-sync via TypeORM, non versionné)
- **Language**: French throughout (UI, comments, database)

## Quick Start
```bash
# Backend (terminal 1)
cd backend
npm install
npm run start:dev

# Frontend (terminal 2)
cd frontend
npm install
npm run dev
```

Comptes de test (voir `backend/src/seed.ts`, mot de passe `password123`) :
- `admin@autoparts.com` (admin_technique)
- `commercial@autoparts.com` (admin_commercial)
- `user@test.com` (acheteur)

## Key Commands
| Task | Backend | Frontend |
|------|---------|----------|
| Dev server | `npm run start:dev` | `npm run dev` |
| Build | `npm run build` | `npm run build` |
| Lint | `npm run lint` | `npm run lint` |
| Test | `npm run test` | — |

## Architecture
- **Backend routes**: All prefixed with `/api` (set in `main.ts:21`)
- **Frontend proxy**: Vite proxies `/api/*` → `http://localhost:8800` (configured in `vite.config.ts:9-14`)
- **Auth**: JWT-based, roles: `admin_technique`, `admin_commercial`, `vendeur`, `acheteur`
- **OTP**: Pas de système OTP (supprimé lors de la restructuration). Connexion directe email/mot de passe pour tous les rôles.
- **Email**: Notifications sent on registration/login (configurable via `.env`)
- **CORS**: Configurable via `CORS_ORIGIN` (`main.ts:8-11`), défaut `http://localhost:5173`
- **Rate limiting**: 30 requêtes / 60s (`ThrottlerModule`)

## Environment Setup
Backend `.env` (copier depuis `.env.example`) :
```
EMAIL_USER=...          # SMTP sender
EMAIL_PASSWORD=...      # SMTP password
ADMIN_EMAIL=...         # Notification recipient
JWT_SECRET=...
PORT=8800
CORS_ORIGIN=http://localhost:5173
AI_PROVIDER=openai|gemini
OPENAI_API_KEY=...      # If using OpenAI
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=...      # If using Gemini
GEMINI_MODEL=gemini-1.5-flash
```

## Important Notes
- **Admin limit**: Max 1 admin technique + 1 admin commercial (compteur dans `auth.service.ts:128-140`)
- **SQLite databases**: `ventepieces.db` (active, générée par TypeORM + seed). Ces fichiers sont ignorés par git.
- **No CI/CD**: No GitHub Actions or pre-commit hooks configured
- **No frontend tests**: Frontend has no test configuration

## File Structure
```
backend/
├── src/
│   ├── auth/          # JWT auth, rôles, guards
│   ├── products/      # Product CRUD + catégories
│   ├── orders/        # Order management
│   ├── demandes/      # Product requests
│   ├── marques/       # Marques automobiles
│   ├── notifications/ # Notifications
│   ├── email/         # SMTP notifications
│   ├── ai/            # Chatbot + génération IA
│   └── entities/      # TypeORM entities
└── ventepieces.db     # SQLite database (générée, non versionnée)

frontend/
├── src/
│   ├── pages/         # Route components (34 files)
│   ├── components/    # Shared UI (Nav, Footer, ChatWidget)
│   ├── context/       # Auth, Cart, Toast providers
│   └── hooks/         # Custom React hooks
└── vite.config.ts     # Dev server + API proxy
```

## Gotchas
- Frontend uses `.jsx` (not `.tsx`) - no TypeScript in frontend components
- Backend TypeScript config: `noImplicitAny: false`, `strict: false` (lenient)
- Database tables auto-created by TypeORM `synchronize: true` - no migrations (production : à désactiver et migrer)
- Seed: `backend/src/seed.ts` peuple `ventepieces.db` (admin + test user)
- `main.ts` : `ValidationPipe` avec `whitelist` + `forbidNonWhitelisted` (rejette les champs inattendus)