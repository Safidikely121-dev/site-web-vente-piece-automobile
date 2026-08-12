import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Nav.css";

export default function Nav() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMobile}>
          <i className="fa-solid fa-car"></i> AutoParts
        </Link>

        <button
          className="nav-hamburger"
          type="button"
          aria-label="Menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <i className={`fa-solid ${mobileOpen ? "fa-xmark" : "fa-bars"}`}></i>
        </button>

        <ul className={`nav-menu ${mobileOpen ? "nav-menu--open" : ""}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMobile}>Accueil</Link>
          </li>

          <li className="nav-item">
            <Link to="/entreprises" className="nav-link" onClick={closeMobile}>Offres</Link>
          </li>

          <li className="nav-item">
            <Link to="/recherche" className="nav-link" onClick={closeMobile}>Recherche</Link>
          </li>

          {user?.role === "vendeur" && (
            <li className="nav-item">
              <Link to="/ajouter-commande" className="nav-link" onClick={closeMobile}>Ajouter commande</Link>
            </li>
          )}

          {isAdmin && (
            <li className="nav-item">
              <Link to="/admin" className="nav-link" onClick={closeMobile}>
                <i className="fa-solid fa-shield-halved"></i> Admin
              </Link>
            </li>
          )}

          {user?.role !== "vendeur" && (
            <li className="nav-item">
              <Link to="/panier" className="nav-link" onClick={closeMobile}>
                <i className="fa-solid fa-cart-shopping"></i>
                Panier
                {cart.length > 0 && <span className="nav-cart-count">{cart.length}</span>}
              </Link>
            </li>
          )}

          <li className="nav-item">
            {user ? (
              <button className="nav-link" type="button" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
              </button>
            ) : (
              <Link to="/login" className="nav-link" onClick={closeMobile}>
                <i className="fa-solid fa-right-to-bracket"></i> Connexion
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
