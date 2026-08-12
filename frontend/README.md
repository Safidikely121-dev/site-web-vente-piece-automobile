# Frontend AutoParts - Site de Pièces Automobiles

Application frontend du site **AutoParts** (vente de pièces automobiles), développée avec **React 19** et **Vite**.

## Fonctionnalités

- 🏠 Page d'accueil avec présentation
- 🏢 Liste des marques / entreprises partenaires
- 📂 Catégorisation des pièces par système
- 🛒 Panier personnel par utilisateur (localStorage par compte)
- 📦 Passage de commande avec adresse de livraison
- 🔐 Authentification JWT (admin / vendeur / acheteur)
- 🤖 Chatbot IA intégré
- 📱 Design responsive

## Installation

```bash
npm install
```

## Lancement en développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:5173`. Les appels `/api/*` sont redirigés vers `http://localhost:8800` via le proxy Vite (`vite.config.ts`).

## Build de production

```bash
npm run build
```

Sortie générée dans `dist/`. Il suffit de servir ce dossier statiquement et de configurer le backend sur le même domaine (ou utiliser la variable `CORS_ORIGIN`).

## Structure du projet

```
src/
├── components/    # Nav, Footer, ChatWidget, guards
├── context/       # AuthContext, CartContext, ToastContext
├── hooks/         # useTitle
├── pages/         # Pages de l'application (34 fichiers)
├── styles/        # Feuilles de style CSS
├── assets/        # Images et logos
├── App.jsx        # Routage
└── main.jsx       # Point d'entrée
```

## Routes principales

| Route                          | Description                          |
|--------------------------------|--------------------------------------|
| `/`                            | Accueil                              |
| `/login`                       | Connexion                            |
| `/register`                    | Inscription                          |
| `/entreprises`                 | Marques partenaires                  |
| `/categories/:entreprise`      | Catégories par entreprise            |
| `/panier`                      | Panier de l'utilisateur              |
| `/checkout`                    | Validation de commande               |
| `/admin/login`                 | Espace administrateur                |
| `/admin/technique`             | Dashboard admin technique            |
| `/admin/commercial`            | Dashboard admin commercial           |
| `/demandeproduit`              | Envoyer une demande de pièce         |

## Vérifications

```bash
npm run lint   # ESLint
npm run build  # Compilation + build Vite
```

## Auteur

**RATAHIANJANAHARY Safidisoa Fidel** - Projet de mémoire de Licence.