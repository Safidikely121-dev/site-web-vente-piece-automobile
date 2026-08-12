-- Script complet pour créer toutes les tables SQLite du projet VentePiècesAuto
-- Exécuter: sqlite3 backend/piece_auto.db < backend/create_all_tables.sql

-- Table Category
CREATE TABLE IF NOT EXISTS "category" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" VARCHAR NOT NULL
);

-- Table User
CREATE TABLE IF NOT EXISTS "user" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "email" VARCHAR NOT NULL,
  "password" VARCHAR NOT NULL,
  "pseudo" VARCHAR,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table Product
CREATE TABLE IF NOT EXISTS "product" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "nom" VARCHAR NOT NULL,
  "prix" VARCHAR NOT NULL,
  "marque" VARCHAR,
  "description" TEXT,
  "categoryId" INTEGER NOT NULL,
  FOREIGN KEY ("categoryId") REFERENCES "category" ("id")
);

-- Table Order
CREATE TABLE IF NOT EXISTS "order" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "client" VARCHAR NOT NULL,
  "email" VARCHAR NOT NULL,
  "telephone" VARCHAR NOT NULL,
  "adresse" VARCHAR NOT NULL,
  "paiement" VARCHAR NOT NULL,
  "produit" VARCHAR NOT NULL,
  "prix" VARCHAR NOT NULL,
  "date" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table Ajouter Demande (demandes)
CREATE TABLE IF NOT EXISTS "ajouter_demande" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "nom" VARCHAR NOT NULL,
  "email" VARCHAR NOT NULL,
  "telephone" VARCHAR NOT NULL,
  "adresse" VARCHAR NOT NULL,
  "marque" VARCHAR NOT NULL,
  "categorie" VARCHAR NOT NULL,
  "produit" VARCHAR NOT NULL,
  "quantite" INTEGER NOT NULL DEFAULT 1,
  "description" TEXT NOT NULL,
  "emailNotified" BOOLEAN NOT NULL DEFAULT 0,
  "date" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_product_category ON product(categoryId);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_order_date ON "order"(date);

-- Données de test (utilisateurs)
INSERT OR IGNORE INTO "user" (email, password, pseudo) VALUES 
('admin@test.com', '$2b$10$K.ExampleHashForAdminPassword123', 'Admin'),
('user@test.com', '$2b$10$K.ExampleHashForUserPassword123', 'User');

-- Données de test (catégories)
INSERT OR IGNORE INTO "category" (name) VALUES 
('Roue'),
('Moteur'),
('Freinage'),
('Direction'),
('Transmission'),
('Refroidissement'),
('Admission'),
('Eclairage'),
('Interieur');

-- Données de test (produits exemple)
INSERT OR IGNORE INTO "product" (nom, prix, marque, description, categoryId) VALUES 
('Pneu Michelin', '800 000 Ar', 'Michelin', 'Pneu été haute performance', 1),
('Filtre à huile', '150 000 Ar', 'Mann', 'Filtre original qualité OE', 2),
('Disque de frein', '450 000 Ar', 'Brembo', 'Disque ventilé avant', 3),
('Biellette direction', '200 000 Ar', 'Lemförder', 'Biellette réglable droite', 4);

PRINT '✅ Toutes les tables créées avec succès avec données de test !';

