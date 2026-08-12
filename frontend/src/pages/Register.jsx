import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useTitle from "../hooks/useTitle";
import "../styles/Formulaires.css";

export default function Register() {
  const { addToast } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();

  useTitle("Créer un compte");

  const [form, setForm] = useState({
    email: "",
    password: "",
    pseudo: "",
    fullName: "",
    telephone: "",
    adresse: "",
    role: "acheteur",
  });
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const phoneRegex = /^(032|034|033|038)\s?\d{2}\s?\d{3}\s?\d{2}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim();
    const password = form.password.trim();
    const pseudo = form.pseudo.trim();
    const fullName = form.fullName.trim();
    const telephone = form.telephone.trim();
    const adresse = form.adresse.trim();
    const role = form.role === "vendeur" ? "vendeur" : "acheteur";

    if (!email || !password || !pseudo) {
      addToast("Veuillez remplir tous les champs.", "error");
      return;
    }
    if (!fullName) {
      addToast("Veuillez renseigner votre nom complet.", "error");
      return;
    }
    if (!telephone) {
      addToast("Veuillez renseigner votre numéro de téléphone.", "error");
      return;
    }
    if (!phoneRegex.test(telephone.replace(/\s/g, ""))) {
      addToast("Numéro de téléphone malgache invalide (ex: 034 12 345 67).", "error");
      return;
    }
    if (!adresse) {
      addToast("Veuillez renseigner votre adresse.", "error");
      return;
    }
    if (!isValidEmail(email)) {
      addToast("Email invalide.", "error");
      return;
    }

    try {
      setLoading(true);
      const result = await register({ email, password, pseudo, fullName, telephone, adresse, role });

      if (!result?.success) {
        addToast(result?.message || "Erreur lors de l'inscription.", "error");
        return;
      }

      addToast("Compte créé avec succès. Connectez-vous !", "success");
      navigate("/login");
    } catch {
      addToast("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <div className="container">
        <h2 className="title">
          <i className="fa-solid fa-user-plus"></i> Créer un compte
        </h2>
        <div className="center">
          <form className="form-box" onSubmit={handleSubmit} style={{ maxWidth: "420px", margin: "0 auto" }}>
            <div className="form-group">
              <label>Pseudo</label>
              <input
                type="text"
                placeholder="Votre pseudo"
                value={form.pseudo}
                onChange={(e) => setForm({ ...form, pseudo: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Nom complet</label>
              <input
                type="text"
                placeholder="Votre nom et prénom"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Numéro de téléphone</label>
              <input
                type="tel"
                placeholder="034 xx xxx xx"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Adresse</label>
              <input
                type="text"
                placeholder="Votre adresse (ex: Antananarivo, Analakely)"
                value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="Choisissez un mot de passe"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Je m'inscris en tant que</label>
              <div className="role-selector">
                <label className={`role-option ${form.role === "acheteur" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="acheteur"
                    checked={form.role === "acheteur"}
                    onChange={() => setForm({ ...form, role: "acheteur" })}
                  />
                  <i className="fa-solid fa-cart-shopping"></i>
                  <span>Acheteur</span>
                </label>

                <label className={`role-option ${form.role === "vendeur" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="vendeur"
                    checked={form.role === "vendeur"}
                    onChange={() => setForm({ ...form, role: "vendeur" })}
                  />
                  <i className="fa-solid fa-store"></i>
                  <span>Vendeur</span>
                </label>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "6px" }}>
                {form.role === "vendeur"
                  ? "Vous pourrez ajouter et supprimer vos produits."
                  : "Vous pourrez ajouter des produits au panier et faire des demandes."}
              </p>
            </div>

            <button className="btn-auth-primary" disabled={loading}>
              {loading ? "Inscription..." : "Créer mon compte"}
            </button>

            <div className="auth-divider">ou</div>

            <p className="auth-text">Vous avez déjà un compte ?</p>

            <button type="button" className="btn-auth-secondary" onClick={() => navigate("/login")}>
              Se connecter
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
