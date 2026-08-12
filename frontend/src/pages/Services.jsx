import Nav from "../components/Nav";
import Footer from "../components/Footer";
import useTitle from "../hooks/useTitle";

export default function Services() {
  useTitle("Services");

  return (
    <>
      <Nav />
      <div className="container">
        <h2 className="title">Nos Services</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
          <div className="info-card">
            <h3><i className="fa-solid fa-magnifying-glass"></i> Recherche rapide</h3>
            <p>
              Trouvez la pièce exacte dont vous avez besoin grâce à notre recherche
              par nom, catégorie ou prix. Notre assistant IA comprend même le langage naturel.
            </p>
          </div>

          <div className="info-card">
            <h3><i className="fa-solid fa-cart-shopping"></i> Commande simplifiée</h3>
            <p>
              Ajoutez les pièces à votre panier et validez votre commande en quelques
              étapes. Paiement par Mobile Money, virement bancaire ou espèces.
            </p>
          </div>

          <div className="info-card">
            <h3><i className="fa-solid fa-headset"></i> Assistance IA</h3>
            <p>
              Notre chatbot intelligent est disponible 24/7 pour répondre à vos questions
              sur les pièces, la livraison ou le paiement.
            </p>
          </div>

          <div className="info-card">
            <h3><i className="fa-solid fa-bell"></i> Notifications</h3>
            <p>
              Recevez des notifications par email lorsqu'un produit correspondant à votre
              demande est publié sur la plateforme.
            </p>
          </div>

          <div className="info-card">
            <h3><i className="fa-solid fa-store"></i> Espace vendeur</h3>
            <p>
              Publiez vos annonces de pièces automobiles, gérez vos produits et
              contactez directement les acheteurs intéressés.
            </p>
          </div>

          <div className="info-card">
            <h3><i className="fa-solid fa-shield-halved"></i> Administration</h3>
            <p>
              Tableau de bord complet pour gérer les commandes, les utilisateurs
              et analyser les demandes clients avec des insights IA.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
