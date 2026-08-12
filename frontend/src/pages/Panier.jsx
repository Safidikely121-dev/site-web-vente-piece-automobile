import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import useTitle from "../hooks/useTitle";

export default function Panier() {
  useTitle("Mon Panier");
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const total = cart.reduce((acc, item) => {
    const price = parseInt(item.prix.replace(/ /g, ""));
    return acc + (isNaN(price) ? 0 : price);
  }, 0);

  return (
    <>
      <Nav />
      <div className="container">
        <h2 className="title">
          <i className="fa-solid fa-cart-shopping"></i> Mon Panier
        </h2>

        {cart.length === 0 ? (
          <div className="message">
            <i className="fa-solid fa-cart-arrow-down" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem", opacity: 0.3 }}></i>
            Votre panier est vide.
          </div>
        ) : (
          <>
            <div className="grid">
              {cart.map((item) => (
                <div key={item.cartId} className="product-card">
                  <img src={item.image} alt={item.nom} className="product-img" />
                  <h3>{item.nom}</h3>
                  <p style={{ fontWeight: 800, color: "var(--primary)" }}>{item.prix}</p>
                  <div className="btn-group">
                    <button
                      className="delete-btn"
                      onClick={() => removeFromCart(item.cartId)}
                    >
                      <i className="fa-solid fa-trash"></i> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Nombre d'articles :</span>
                <strong>{cart.length}</strong>
              </div>
              <div className="cart-summary-row total-row">
                <span>Total à payer :</span>
                <strong className="total-price">{total.toLocaleString()} Ar</strong>
              </div>
            </div>

            <div className="center" style={{ marginTop: "2rem" }}>
              <button
                className="card-btn"
                onClick={() => navigate("/checkout")}
                style={{ padding: "0.8rem 2rem" }}
              >
                <i className="fa-solid fa-credit-card"></i> Passer à la caisse
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
