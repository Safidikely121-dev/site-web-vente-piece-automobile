import Nav from "../components/Nav";
import Footer from "../components/Footer";
import useTitle from "../hooks/useTitle";

export default function About() {
  useTitle("À propos");

  return (
    <>
      <Nav />
      <div className="container">
        <h2 className="title">À propos d'AutoParts</h2>

        <div className="info-card" style={{ maxWidth: 800, margin: "0 auto 1.5rem" }}>
          <h3><i className="fa-solid fa-bullseye"></i> Notre mission</h3>
          <p>
            AutoParts vous aide à trouver et acheter des pièces automobiles à travers
            un catalogue simple et une expérience de commande rapide. Nous connectons
            acheteurs et vendeurs de pièces auto au Madagascar.
          </p>
        </div>

        <div className="info-card" style={{ maxWidth: 800, margin: "0 auto 1.5rem" }}>
          <h3><i className="fa-solid fa-star"></i> Ce qui nous distingue</h3>
          <ul>
            <li>Catalogue de pièces classées par catégorie et par marque</li>
            <li>Recherche intelligente avec assistance IA</li>
            <li>Système de demande pour les pièces introuvables</li>
            <li>Paiement flexible : Mobile Money, virement, espèces</li>
            <li>Notifications email pour les nouvelles publications</li>
          </ul>
        </div>

        <div className="info-card" style={{ maxWidth: 800, margin: "0 auto" }}>
          <h3><i className="fa-solid fa-users"></i> Notre équipe</h3>
          <p>
            Projet réalisé dans le cadre du stage L3 MME NIVO.
            AutoParts est une application web moderne construite avec
            React et NestJS.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
