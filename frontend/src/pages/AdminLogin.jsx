import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useTitle from "../hooks/useTitle";
import "../styles/Formulaires.css";

export default function AdminLogin() {
  const { addToast } = useToast();
  const { adminLogin, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useTitle("Espace administrateur - Connexion");

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isAdmin) navigate("/admin", { replace: true });
  }, [user, isAdmin, navigate]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = form.email.trim();
    const password = form.password.trim();

    if (!email || !password)
      return addToast("Veuillez remplir tous les champs.", "error");
    if (!isValidEmail(email)) return addToast("Email invalide.", "error");

    try {
      setLoading(true);
      const result = await adminLogin(email, password);
      if (result.success) {
        addToast("Connexion administrateur réussie", "success");
        navigate("/admin", { replace: true });
      } else {
        addToast(result.message || "Identifiants invalides", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Erreur serveur", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <div className="container">
        <div className="admin-login-header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 className="title">
            <i className="fa-solid fa-shield-halved"></i> Espace administrateur
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Connexion réservée aux administrateurs technique et commercial.
          </p>
        </div>
        <div className="center">
          <form className="form-box" onSubmit={handleLogin} style={{ maxWidth: "420px", margin: "0 auto" }}>
            <div className="form-group">
              <label>Email administrateur</label>
              <input
                type="email"
                placeholder="admin@entreprise.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="Votre mot de passe administrateur"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button className="btn-auth-primary" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter à l'espace admin"}
            </button>

            <div className="auth-divider">ou</div>

            <button
              type="button"
              className="btn-auth-secondary"
              onClick={() => navigate("/login")}
            >
              Retour à l'espace clients
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
