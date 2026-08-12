import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

// Clé de stockage personnelle : chaque utilisateur a son propre panier.
// Si l'utilisateur est connecté -> "cart_<id>", sinon -> clé invité partagée.
const getCartKey = (user) => {
  const id = user?.id;
  return id != null ? `cart_${id}` : "cart_guest";
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartKey, setCartKey] = useState(() => getCartKey(user));

  // Charger le panier de l'utilisateur courant depuis localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(cartKey);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Si l'utilisateur change (login/logout), on recharge le bon panier
  useEffect(() => {
    const nextKey = getCartKey(user);
    if (nextKey !== cartKey) {
      setCartKey(nextKey);
      const savedCart = localStorage.getItem(nextKey);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    }
  }, [user, cartKey]);

  // Sauvegarder dans localStorage sous la clé personnelle à chaque modification
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  const addToCart = (product) => {
    setCart((prev) => [...prev, { ...product, cartId: Date.now() }]);
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
