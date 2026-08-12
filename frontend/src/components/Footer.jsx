import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section footer-brand">
          <h3>
            <i className="fa-solid fa-car"></i> AutoParts
          </h3>
          <p>Votre partenaire de confiance pour toutes les pièces automobiles de qualité au Madagascar.</p>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li>
              <i className="fa-solid fa-envelope"></i>
              <span>safidisoafidel@gmail.com</span>
            </li>
            <li>
              <i className="fa-solid fa-phone"></i>
              <span>+261 33 18 385 41</span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liens utiles</h4>
          <ul>
            <li><a href="/about">À propos</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/support">Support</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 AutoParts. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
