# Plan de fusion : Categorierech → Categories

## Analyse

### Categories.jsx (route `/categories/:entreprise`)
+ **Design riche** : cartes colorées avec emojis (`cat-card-btn`, `cat-card-emoji`, `cat-card-arrow`)
+ **Bouton "Supprimer"** par carte (delete catégorie)
+ **Bouton "+ Ajouter catégorie"** en bas
+ **Pas de barre de recherche**
+ **N'utilise pas `useAuth`**

### Categorierech.jsx (route `/Categorierech/:entreprise`)
+ **Design simple** : boutons dans une grille standard
+ **Barre de recherche** pour filtrer les catégories
+ **Bouton "+ Ajouter demandes"** en bas
+ **Pas de bouton Supprimer**
+ **N'utilise pas `useAuth`**

## Plan des modifications

### 1. Modifier `Categories.jsx` → Page unique unifiée
- Ajouter l'import de `useAuth`
- Ajouter `useState` pour `search` (déjà importé)
- Ajouter la barre de recherche (affichée **uniquement pour acheteur**)
- Ajouter le filtrage des catégories par recherche
- Conserver le design des cartes colorées avec emojis (identique pour les deux rôles)
- Afficher le bouton "Supprimer" **uniquement pour vendeur**
- Afficher "+ Ajouter catégorie" **uniquement pour vendeur**
- Afficher "+ Ajouter demandes" **uniquement pour acheteur**

### 2. Modifier `App.jsx`
- Rediriger la route `/Categorierech/:entreprise` vers le composant `Categories` au lieu de `Categorierech`

### 3. Supprimer `Categorierech.jsx`
- Le fichier n'est plus nécessaire

### Routage final :
- `/categories/:entreprise` → Categories.jsx (via "Offres")
- `/Categorierech/:entreprise` → Categories.jsx (via "Recherche")

### Interface unique pour les deux rôles :
- Même mise en page avec cartes colorées et emojis
- **Vendeur voit** : Cartes + bouton Supprimer + bouton Ajouter catégorie
- **Acheteur voit** : Barre de recherche + Cartes + bouton Ajouter demandes

