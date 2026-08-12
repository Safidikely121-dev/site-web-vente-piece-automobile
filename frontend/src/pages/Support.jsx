import Nav from "../components/Nav";
import Footer from "../components/Footer";
import useTitle from "../hooks/useTitle";

export default function Support() {
  useTitle("Support");

  return (
    <>
      <Nav />
      <div className="container">
        <h2 className="title">Support</h2>

        <div className="info-card" style={{ maxWidth: 700, margin: "0 auto 1.5rem" }}>
          <h3><i className="fa-solid fa-envelope"></i> Contactez-nous</h3>
          <p>
            Besoin d'aide ? Notre équipe est disponible pour répondre à vos questions
            et vous accompagner dans vos achats.
          </p>
          <ul style={{ marginTop: "1rem" }}>
            <li>
              <i className="fa-solid fa-envelope" style={{ color: "var(--primary)", width: 16 }}></i>
              safidisoafidel@gmail.com
            </li>
            <li>
              <i className="fa-solid fa-phone" style={{ color: "var(--primary)", width: 16 }}></i>
              +261 33 18 385 41
            </li>
          </ul>
        </div>

        <div className="info-card" style={{ maxWidth: 700, margin: "0 auto 1.5rem" }}>
          <h3><i className="fa-solid fa-circle-question"></i> Questions fréquentes</h3>
          <ul>
            <li>Comment passer une commande ? — Ajoutez des produits au panier puis validez le checkout.</li>
            <li>Quels moyens de paiement acceptés ? — Mobile Money, virement bancaire, espèces à la livraison.</li>
            <li>Comment devenir vendeur ? — Inscrivez-vous avec le rôle "Vendeur" lors de l'inscription.</li>
            <li>Puis-je modifier ma commande ? — Contactez-nous par email pour toute modification.</li>
          </ul>
        </div>

        <div className="info-card" style={{ maxWidth: 700, margin: "0 auto" }}>
          <h3><i className="fa-solid fa-comments"></i> Chat en ligne</h3>
          <p>
            Utilisez le bouton de chat en bas à droite de l'écran pour poser vos questions
            à notre assistant virtuel. Il est disponible 24/7.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
