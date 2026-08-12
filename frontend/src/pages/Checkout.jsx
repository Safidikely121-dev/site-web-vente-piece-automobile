import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import useTitle from "../hooks/useTitle";
import { useToast } from "../context/ToastContext";

const PHONE_REGEX = /^(032|034|033|038)\s?\d{2}\s?\d{3}\s?\d{2}$/;

export default function Checkout() {
  const { addToast } = useToast();
  useTitle("Validation Commande");
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();
  const { user, getUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const [paiement, setPaiement] = useState(location.state?.paiement || "Mobile Money");
  const [profileReady, setProfileReady] = useState(false);
  const [needCompletion, setNeedCompletion] = useState(false);
  const [completion, setCompletion] = useState({
    fullName: "",
    telephone: "",
    adresse: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (authLoading || !user) return;
      const profile = await getUser();
      if (cancelled) return;

      if (profile?.fullName && profile?.telephone && profile?.adresse) {
        setProfileReady(true);
        setNeedCompletion(false);
      } else {
        setCompletion((prev) => ({
          fullName: profile?.fullName || prev.fullName,
          telephone: profile?.telephone || prev.telephone,
          adresse: profile?.adresse || prev.adresse,
        }));
        setNeedCompletion(true);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, getUser]);

  const total = cart.reduce((acc, item) => {
    const price = parseInt(item.prix.replace(/ /g, ""));
    return acc + (isNaN(price) ? 0 : price);
  }, 0);

  const handleComplete = async (e) => {
    e.preventDefault();

    if (completion.fullName.trim().length < 2) {
      addToast("Veuillez renseigner votre nom complet.", "error");
      return;
    }
    if (!PHONE_REGEX.test(completion.telephone.replace(/\s/g, ""))) {
      addToast("Veuillez entrer un numéro de téléphone malgache valide (ex: 034 12 345 67)", "error");
      return;
    }
    if (completion.adresse.trim().length < 3) {
      addToast("Veuillez renseigner votre adresse de livraison.", "error");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(completion),
      });

      if (res.ok) {
        addToast("Informations de livraison enregistrées.", "success");
        setNeedCompletion(false);
        setProfileReady(true);
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data?.message || "Erreur lors de l'enregistrement.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Erreur de connexion au serveur.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0 || !profileReady) return;

    setLoading(true);
    const orderData = {
      produit: cart.map((item) => item.nom).join(", "),
      prix: `${total.toLocaleString()} Ar`,
      paiement,
      date: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSuccess(true);
        clearCart();
        setTimeout(() => navigate("/"), 3000);
      } else {
        addToast(data?.message || "Erreur lors de la commande.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Erreur de connexion au serveur.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Nav />
        <div className="container center">
          <h2 className="title">
            <i className="fa-solid fa-circle-check" style={{ color: "var(--success)" }}></i> Commande validée !
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 500, margin: "0 auto" }}>
            Merci pour votre achat. Vous allez être redirigé vers l'accueil...
          </p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="container">
        <h2 className="title">
          <i className="fa-solid fa-credit-card"></i> Validation de la commande
        </h2>

        <div className="checkout-grid">
          <div className="order-summary">
            <h3>
              <i className="fa-solid fa-receipt"></i> Résumé du panier
            </h3>
            {cart.map((item) => (
              <div key={item.cartId} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", padding: "0.4rem 0", borderBottom: "1px solid var(--border-light)" }}>
                <span style={{ color: "var(--text-secondary)" }}>{item.nom}</span>
                <strong style={{ color: "var(--text-primary)" }}>{item.prix}</strong>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "2px solid var(--border-light)" }}>
              <strong style={{ fontSize: "1.1rem" }}>Total :</strong>
              <strong style={{ color: "var(--primary)", fontSize: "1.2rem" }}>{total.toLocaleString()} Ar</strong>
            </div>
          </div>

          <div className="form-box">
            <h3>
              <i className="fa-solid fa-user"></i> Vos informations
            </h3>

            {needCompletion ? (
              <form onSubmit={handleComplete}>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  Votre compte ne possède pas encore vos informations de livraison.
                  Complétez-les une seule fois ci-dessous : elles seront enregistrées
                  sur votre compte et réutilisées automatiquement à chaque commande.
                </p>
                <div className="form-group">
                  <label htmlFor="fullName">Nom complet *</label>
                  <input
                    id="fullName"
                    value={completion.fullName}
                    onChange={(e) => setCompletion({ ...completion, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telephone">Téléphone *</label>
                  <input
                    id="telephone"
                    placeholder="034 xx xxx xx"
                    value={completion.telephone}
                    onChange={(e) => setCompletion({ ...completion, telephone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adresse">Adresse de livraison *</label>
                  <input
                    id="adresse"
                    value={completion.adresse}
                    onChange={(e) => setCompletion({ ...completion, adresse: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="card-btn"
                  style={{ width: "100%", marginTop: "1rem", padding: "0.85rem" }}
                  disabled={loading}
                >
                  {loading ? (
                    "Chargement..."
                  ) : (
                    <>
                      <i className="fa-solid fa-save"></i> Enregistrer et continuer
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="paiement">Mode de paiement</label>
                  <select
                    id="paiement"
                    value={paiement}
                    onChange={(e) => setPaiement(e.target.value)}
                  >
                    <option>Mobile Money</option>
                    <option>Virement Bancaire</option>
                    <option>Espèces à la livraison</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="card-btn"
                  style={{ width: "100%", marginTop: "1rem", padding: "0.85rem" }}
                  disabled={loading || cart.length === 0}
                >
                  {loading ? (
                    "Chargement..."
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i> Confirmer la commande
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
