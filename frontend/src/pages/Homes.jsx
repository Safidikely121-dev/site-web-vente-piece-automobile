/**
 * Page d'accueil principale - Homes
 * 
 * Affiche:
 * - Section héros avec message de bienvenue
 * - Boutons de navigation vers entreprises et catégories
 * - Cartes d'information sur les fonctionnalités
 */

import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import "./Home.css";
import { useAuth } from "../context/AuthContext";
import "../styles/Boutton.css";
import "../styles/Global.css";





/**
 * Composant de page d'accueil
 * @returns {JSX.Element} Page d'accueil complet avec nav et footer
 */
export default function Homes() {
  const navigate = useNavigate();

  return (

    <>
      <Nav />
      <div className="container">
        {/* Section héros avec titre et CTA */}
        <section className="hero-home">
          <div className="hero-copy">
            <h1>AutoParts</h1>
            <p>
              Trouvez toutes les pièces automobiles  avec des
              marques reconnues 
            </p>
            <div className="hero-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/entreprises")}
              >
                offres
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/recherche")}
              >
                recherche
              </button>
            </div>
          </div>


        </section>

        
      </div>
      <Footer />
    </>
  );
}