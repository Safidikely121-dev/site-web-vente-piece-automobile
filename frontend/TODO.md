# TODO - Panier personnel par utilisateur

**Statut : TERMINÉ**

- [x] Analyser l'implémentation actuelle du panier (CartContext.jsx → localStorage sous la clé `cart`)
- [x] Valider le plan avec l'utilisateur
- [x] Modifier `frontend/auto-parts-frontend/src/context/CartContext.jsx` (désormais `frontend/src/context/CartContext.jsx`) pour :
  - [x] Clé de stockage par utilisateur (`cart_${user.id}`) selon l'utilisateur connecté
  - [x] Fallback invité (`cart_guest`)
  - [x] Recharger le bon panier au changement d'utilisateur (login/logout)
  - [x] Conserver l'API publique (cart, addToCart, removeFromCart, clearCart)
- [x] Tester (build / dev) et vérifier que deux acheteurs ont des paniers distincts