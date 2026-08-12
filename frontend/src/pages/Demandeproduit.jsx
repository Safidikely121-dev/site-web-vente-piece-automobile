import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import useTitle from "../hooks/useTitle";
import { useAuth } from "../context/AuthContext";
import "../styles/Demande.css";
import "../styles/Formulaires.css";

export default function DemandeProduit() {
  useTitle("Demande de produit");

  const navigate = useNavigate();
  const { user, isLoggedIn, loading } = useAuth();

  const [formData, setFormData] = useState({
    telephone: "",
    adresse: "",
    marque: "",
    categorie: "",
    produit: "",
    quantite: 1,
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seul un utilisateur connecté peut créer une demande.
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, loading, navigate]);

  // Attendre la restauration du compte depuis le token avant de décider.
  if (loading) {
    return null;
  }

  if (!isLoggedIn) {
    return null;
  }

  // Identité récupérée automatiquement depuis le compte connecté.
  const pseudo = user?.pseudo ?? "";
  const email = user?.email ?? "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantite" ? Number(value) : value,
    });
  };

  const envoyerDemande = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/demandes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          nom: pseudo,
          email,
          pseudo,
          produit: String(formData.produit ?? formData.categorie ?? "").trim(),
          description:
            String(formData.description ?? "").trim() ||
            String(formData.produit ?? "").trim(),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      alert("Votre demande a été envoyée avec succès. Vous recevrez une notification email lorsqu'un produit correspondant sera publié.");

      // L'identité vient du compte connecté : on ne réinitialise que les
      // champs saisis manuellement.
      setFormData({
        telephone: "",
        adresse: "",
        marque: "",
        categorie: "",
        produit: "",
        quantite: 1,
        description: "",
      });
    } catch (error) {
      alert("Erreur lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Nav />
      <div className="container demande-page">
        <h2 className="title">
          <i className="fa-solid fa-circle-plus"></i> Demande de produit
        </h2>

        <div className="demande-grid-main">
          <div className="order-summary">
            <h3 className="demande-side-title">
              <i className="fa-solid fa-circle-info"></i> Pourquoi cette demande ?
            </h3>
            <p className="demande-side-text">
              Remplissez le formulaire ci-dessous. Nos équipes se baseront sur vos infos pour vous proposer
              la meilleure option.
            </p>

            <div className="demande-hint">
              <span className="demande-hint-dot" />
              <span>Astuce : ajoutez la référence ou des détails supplémentaires dans la description.</span>
            </div>
          </div>

          <div className="form-box">
            <h3>
              <i className="fa-solid fa-user"></i> Vos informations
            </h3>

            <form className="demande-form" onSubmit={envoyerDemande}>
              <div className="form-group">
                <label htmlFor="pseudo">Pseudo</label>
                <input id="pseudo" value={pseudo} type="text" name="pseudo" disabled readOnly />
              </div>

              <div className="form-group">
                <label htmlFor="nom">Nom complet</label>
                <input id="nom" value={pseudo} type="text" name="nom" disabled readOnly />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" value={email} type="email" name="email" disabled readOnly />
              </div>

              <div className="form-group">
                <label htmlFor="telephone">Téléphone</label>
                <input id="telephone" value={formData.telephone} onChange={handleChange} type="text" name="telephone" required placeholder="034 xx xxx xx" />
              </div>

              <div className="form-group">
                <label htmlFor="adresse">Adresse</label>
                <input id="adresse" value={formData.adresse} onChange={handleChange} type="text" name="adresse" placeholder="Optionnel" />
              </div>

              <div className="demande-grid">
                <div className="form-group">
                  <label htmlFor="marque">Marque</label>
                  <input id="marque" value={formData.marque} onChange={handleChange} type="text" name="marque" placeholder="Toyota" />
                </div>

                <div className="form-group">
                  <label htmlFor="categorie">Catégorie</label>
                  <input id="categorie" value={formData.categorie} onChange={handleChange} type="text" name="categorie" placeholder="Moteur" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="produit">Produit recherché</label>
                <input id="produit" value={formData.produit} onChange={handleChange} type="text" name="produit" required placeholder="Ex: Filtre à huile" />
              </div>

              <div className="demande-grid">
                <div className="form-group">
                  <label htmlFor="quantite">Quantité</label>
                  <input id="quantite" value={formData.quantite} onChange={handleChange} type="number" name="quantite" min="1" />
                </div>

                <div className="form-group">
                  <label>&nbsp;</label>
                  <div className="demande-hint compacte">
                    <span className="demande-hint-dot" />
                    <span>Plus c'est précis, plus c'est rapide.</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  name="description"
                  placeholder="Décrivez le produit recherché, référence si possible..."
                />
              </div>

              <button type="submit" className="card-btn demande-submit" disabled={isSubmitting}>
                {isSubmitting ? "Envoi en cours..." : <><i className="fa-solid fa-paper-plane"></i> Envoyer la demande</>}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
