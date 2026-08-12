# AutoParts - Site Web de Vente de Pièces Automobiles

AutoParts est une application web développée dans le cadre d'un projet de mémoire de Licence.
Elle permet de mettre en relation des vendeurs et des acheteurs de pièces automobiles à travers une plateforme simple, sécurisée et intuitive.

Les vendeurs peuvent publier leurs produits, tandis que les acheteurs peuvent consulter les offres, effectuer des commandes ou envoyer une demande lorsqu'un produit n'est pas disponible.

## Fonctionnalités

### Authentification
- Inscription
- Connexion
- Déconnexion
- Gestion des rôles (Administrateur, Vendeur, Acheteur)
- Blocage / déblocage des utilisateurs

### Gestion des produits
- Ajouter un produit
- Modifier un produit
- Supprimer un produit
- Recherche des produits
- Filtrage par catégorie
- Images des produits

### Gestion des catégories
- Création des catégories
- Modification
- Suppression

### Gestion des commandes
- Ajouter au panier (panier personnel par utilisateur)
- Passer une commande
- Historique des commandes

### Gestion des demandes
- Envoyer une demande lorsqu'un produit est indisponible
- Consultation des demandes par l'administrateur
- Notification lorsque le produit devient disponible

### Notifications par e-mail
- E-mail de bienvenue après inscription
- Notification automatique lors de la disponibilité d'un produit demandé
- Notification des connexions et inscriptions des utilisateurs

### Administration
- Gestion des utilisateurs
- Gestion des produits
- Gestion des catégories
- Gestion des demandes
- Gestion des commandes

## Technologies utilisées

### Frontend
- React 19
- Vite
- React Router
- CSS

### Backend
- NestJS
- TypeORM
- Node.js

### Base de données
- SQLite

### Services
- Nodemailer (e-mails)
- JWT (authentification)
- IA (chatbot et génération de descriptions - OpenAI / Gemini)

## Structure du projet

```
AutoParts
|-- backend
|   |-- src
|   |   |-- auth/          # Authentification JWT, rôles
|   |   |-- products/      # Gestion des produits
|   |   |-- orders/        # Gestion des commandes
|   |   |-- demandes/      # Gestion des demandes
|   |   |-- marques/       # Gestion des marques
|   |   |-- categories/    # Gestion des catégories
|   |   |-- notifications/ # Notifications
|   |   |-- email/         # Envoi d'e-mails
|   |   |-- ai/            # Intégration IA
|   |   |-- entities/      # Entités TypeORM
|   |   `-- main.ts        # Point d'entrée (port 8800, préfixe /api)
|   |-- ventepieces.db     # Base SQLite active (générée)
|   `-- package.json
|
|-- frontend
|   |-- src
|   |   |-- pages/         # Pages de l'application
|   |   |-- components/    # Composants partagés
|   |   |-- context/       # Contexte React (Auth, Cart, Toast)
|   |   |-- hooks/         # Hooks personnalisés
|   |   `-- styles/        # Feuilles de style CSS
|   |-- public/
|   `-- package.json
|
`-- README.md
```

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/Safidikely121-dev/site-web-vente-piece-automobile.git
```

### 2. Installer les dépendances

**Backend**

```bash
cd backend
npm install
```

**Frontend**

```bash
cd frontend
npm install
```

### 3. Configurer les variables d'environnement

Copier `backend/.env.example` vers `backend/.env` et renseigner les clés :

```
EMAIL_USER=...          # SMTP sender
EMAIL_PASSWORD=...      # SMTP password
ADMIN_EMAIL=...         # Destinataire des notifications
JWT_SECRET=...          # Clé secrète JWT
AI_PROVIDER=openai|gemini
OPENAI_API_KEY=...
GEMINI_API_KEY=...
```

### 4. Lancer le backend

```bash
npm run start:dev
```

La base SQLite (`ventepieces.db`) est créée automatiquement par TypeORM.

### 5. Lancer le frontend

```bash
npm run dev
```

Le frontend utilise le proxy Vite : les appels `/api/*` sont redirigés vers `http://localhost:8800`.

## Accès

| Service   | URL                         |
|-----------|-----------------------------|
| Frontend  | http://localhost:5173       |
| Backend   | http://localhost:8800/api   |

## Rôles

### Administrateur
- Gérer les utilisateurs (bloquer / supprimer)
- Gérer les catégories
- Gérer les produits
- Gérer les commandes
- Gérer les demandes

### Vendeur
- Publier des produits
- Modifier ses produits
- Supprimer ses produits

### Acheteur
- Consulter les produits
- Ajouter au panier
- Passer une commande
- Envoyer une demande

## Notifications

Le système envoie automatiquement :
- Un e-mail de bienvenue après inscription.
- Une notification lorsqu'un produit demandé devient disponible.
- Une notification lors des connexions et inscriptions.

## Sécurité
- Authentification sécurisée (JWT)
- Gestion des rôles
- Validation des données
- Protection des routes
- Limitation de débit (throttling)

## Auteur

**RATAHIANJANAHARY Safidisoa Fidel**

Projet réalisé dans le cadre du mémoire de Licence.

## Licence

Ce projet est destiné à un usage pédagogique dans le cadre d'un mémoire universitaire.
