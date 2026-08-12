import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import useTitle from "../hooks/useTitle";
import { useToast } from "../context/ToastContext";
import "../styles/Formulaires.css";

export default function Login() {
  const { addToast } = useToast();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useTitle("Connexion");

  const showRegister =
    new URLSearchParams(location.search).get("register") === "true";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showRegister) navigate("/register", { replace: true });
  }, [showRegister, navigate]);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = form.email.trim();
    const password = form.password.trim();

    if (!email || !password) return addToast("Veuillez remplir tous les champs.", "error");
    if (!isValidEmail(email)) return addToast("Email invalide.", "error");

    try {
      setLoading(true);
      const result = await login(email, password);
      if (result.success) {
        addToast("Connexion réussie", "success");
        navigate("/", { replace: true });
      } else {
        addToast(result.message || "Email ou mot de passe incorrect", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Erreur serveur", "error");
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) return null;

  return (
    <>
      <Nav />
      <div className="container">
        <h2 className="title">
          <i className="fa-solid fa-right-to-bracket"></i> Connexion
        </h2>
        <div className="center">
          <form className="form-box" onSubmit={handleLogin} style={{ maxWidth: "420px", margin: "0 auto" }}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="Votre mot de passe"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button className="btn-auth-primary" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <div className="auth-divider">ou</div>

            <p className="auth-text">Vous n'avez pas encore de compte ?</p>

            <button
              type="button"
              className="btn-auth-secondary"
              onClick={() => navigate("/register")}
            >
              Créer un compte
            </button>

            <div className="auth-divider">Espace administrateur</div>

            <button
              type="button"
              className="btn-auth-secondary btn-admin-link"
              onClick={() => navigate("/admin/login")}
            >
              <i className="fa-solid fa-shield-halved"></i> Connexion administrateur
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
