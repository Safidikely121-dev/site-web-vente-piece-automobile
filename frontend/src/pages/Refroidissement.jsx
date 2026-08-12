import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import "./Entreprises.css";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";
import "../styles/Boutton.css";
import "../styles/Global.css";
import "../styles/Recherche.css";

// ===== IMAGES =====
import radiateurImg from "../assets/cylindre.jpg";
import thermostatImg from "../assets/piston.jpg";
import pompeImg from "../assets/soupape.jpg";
import ventilateurImg from "../assets/injecteur.jpg";
import liquideImg from "../assets/valve.jpg";
import courroieImg from "../assets/courroi.jpg";

// ===== DATA INITIAL =====
const dataInitial = [
  { id: 1, nom: "Radiateur moteur", image: radiateurImg, prix: "280 000 Ar", type: "Radiateur", sousType: "Moteur", etat: "Neuf", contact: "034 00 000 00" },
  { id: 2, nom: "Radiateur climatisation", image: radiateurImg, prix: "320 000 Ar", type: "Radiateur", sousType: "Climatisation", etat: "Neuf", contact: "034 00 000 00" },
  { id: 3, nom: "Thermostat 82°C", image: thermostatImg, prix: "45 000 Ar", type: "Thermostat", sousType: "82°C", etat: "Neuf", contact: "034 00 000 00" },
  { id: 4, nom: "Thermostat 89°C", image: thermostatImg, prix: "50 000 Ar", type: "Thermostat", sousType: "89°C", etat: "Neuf", contact: "034 00 000 00" },
  { id: 5, nom: "Pompe à eau", image: pompeImg, prix: "180 000 Ar", type: "Pompe", sousType: "Eau", etat: "Neuf", contact: "034 00 000 00" },
  { id: 6, nom: "Ventilateur électrique", image: ventilateurImg, prix: "250 000 Ar", type: "Ventilateur", sousType: "Moteur", etat: "Neuf", contact: "034 00 000 00" },
  { id: 7, nom: "Liquide refroidissement", image: liquideImg, prix: "30 000 Ar", type: "Liquide", sousType: "Bleu", etat: "Neuf", contact: "034 00 000 00" },
  { id: 8, nom: "Courroie ventilateur", image: courroieImg, prix: "80 000 Ar", type: "Courroie", sousType: "Ventilateur", etat: "Neuf", contact: "034 00 000 00" },
  { id: 9, nom: "Réservoir d'expansion", image: radiateurImg, prix: "65 000 Ar", type: "Réservoir", sousType: "Plastique", etat: "Neuf", contact: "034 00 000 00" },
  { id: 10, nom: "Capteur de température", image: thermostatImg, prix: "35 000 Ar", type: "Capteur", sousType: "Refroidissement", etat: "Neuf", contact: "034 00 000 00" },
];

// ===== CATEGORIES =====
const categories = ["Radiateur", "Thermostat", "Pompe", "Ventilateur", "Liquide"];

// ===== SOUS-CATEGORIES =====
const sousCategories = {
  Radiateur: ["Tous", "Moteur", "Climatisation"],
  Thermostat: ["Tous", "82°C", "89°C"],
  Pompe: ["Tous", "Eau"],
  Ventilateur: ["Tous", "Moteur", "Manuel"],
  Liquide: ["Tous", "Bleu", "Rouge"],
};

export default function Refroidissement() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { subtype } = useParams();
  const { user, isVendeur, isAcheteur, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  
  // ✅ CORRIGÉ: from → =

const [pieces, setPieces] = useState(dataInitial);
  const [categorie, setCategorie] = useState(subtype || categories[0]);
  const [sousCat, setSousCat] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newPart, setNewPart] = useState({
    nom: "", pseudo: "", prix: "", type: "Radiateur", sousType: "Moteur", etat: "Neuf", contact: ""
  });

  // ===== FILTRE =====
  const piecesFiltrees = pieces.filter((p) => {
    if (categorie) {
      if (sousCat !== "Tous" && p.sousType !== sousCat) return false;
      if (p.type !== categorie) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.nom.toLowerCase().includes(q) || p.prix.toLowerCase().includes(q);
    }
    return true;
  });

  // ===== AJOUT =====
  const handleAdd = async () => {
    if (!newPart.nom.trim() || !newPart.prix.trim()) {
      addToast("Veuillez remplir le nom et le prix !", "error");
      return;
    }

    // Envoyer au backend pour déclencher la notification email
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nom: newPart.nom.trim(),
          prix: newPart.prix.trim(),
          marque: newPart.pseudo?.trim() || undefined,
          description: `${newPart.sousType || ''} - ${newPart.etat || 'Neuf'}`.trim(),
          categoryName: "Systèmes de refroidissement",
          etat: newPart.etat || "Neuf",
          contact: newPart.contact || "034 00 000 00",
          sousCategorie: newPart.sousType || "",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erreur HTTP: ${res.status}`);
      }

      const savedProduct = await res.json();
      addToast("Produit publié avec succès ! Les clients seront notifiés.", "success");

      setPieces([
        ...pieces,
        { id: savedProduct.id || Date.now(), ...newPart, image: radiateurImg },
      ]);
    } catch (error) {
      console.error("Erreur publication produit:", error);
      addToast("Erreur lors de la publication du produit", "error");
    }

    setShowForm(false);
    setNewPart({ nom: "", pseudo: "", prix: "", type: "Radiateur", sousType: "Moteur", etat: "Neuf", contact: "034 00 000 00" });
  };

  // ===== SUPPRESSION =====
  const handleDelete = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      setPieces(pieces.filter((p) => p.id !== id));
    }
  };

  // ===== AJOUT AU PANIER =====
  const handleAddToCart = (p) => {
    if (!user) {
      addToast("Veuillez vous connecter !", "error");
      navigate("/login");
      return;
    }
    addToCart(p);
    addToast(`"${p.nom}" ajouté au panier !`);
  };

  return (
    <>
      <Nav />

      <div className="container">
        <h2 className="title"><i className="fa-solid fa-snowflake"></i> Refroidissement</h2>

        <div className="search-container" style={{ marginBottom: "1.5rem" }}>
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery("")} style={{ marginLeft: 8 }}>
              ✖
            </button>
          )}
        </div>

        {/* ===== ÉTAPE 1 : CHOISIR UNE CATÉGORIE ===== */}
        {!categorie && (
          <div className="categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className="cat-btn"
                onClick={() => { setCategorie(cat); setSousCat("Tous"); }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ===== RETOUR À LA SÉLECTION DE CATÉGORIE ===== */}
        {categorie && (
          <button
            className="card-btn secondary"
            onClick={() => { setCategorie(null); setShowForm(false); }}
            style={{ marginBottom: "1rem" }}
          >
            <i className="fa-solid fa-arrow-left"></i> Retour
          </button>
        )}

        {/* ===== LISTE DES PRODUITS ===== */}
        <div className="grid">
          {piecesFiltrees.length === 0 && categorie && (
            <p style={{ textAlign: "center", color: "#888" }}>
              Aucun produit dans cette catégorie.
            </p>
          )}

          {piecesFiltrees.map((p) => (
            <motion.div
              key={p.id}
              className="product-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img src={p.image} alt={p.nom} className="product-img" />
              <h3>{p.nom}</h3>
              <p>👤 Vendeur : <strong>{p.pseudo || "Anonyme"}</strong></p>
              <p>{p.sousType}</p>
              <p>État: <strong>{p.etat || "Neuf"}</strong></p>
              <p>Contact: <strong>{p.contact || "034 00 000 00"}</strong></p>
              <p><strong>{p.prix}</strong></p>

              <div className="btn-group">
                {from === "recherche" ? (
                  <button className="card-btn" onClick={() => {
                    if (!user) { addToast("Veuillez vous connecter !", "error"); navigate("/login"); return; }
                    handleAddToCart(p);
                  }}>
                    <i className="fa-solid fa-cart-shopping"></i> Ajouter au panier
                  </button>
                ) : from === "offres" ? (
                  (isVendeur || isAdmin) ? (
                    <button className="delete-btn" onClick={() => {
                      if (!user) { addToast("Veuillez vous connecter !", "error"); navigate("/login"); return; }
                      handleDelete(p.id);
                    }}>
                      <i className="fa-solid fa-trash"></i> Supprimer
                    </button>
                  ) : null
                ) : (
                  <>
                    {isAcheteur && (
                      <button className="card-btn" onClick={() => handleAddToCart(p)}>
                        <i className="fa-solid fa-cart-shopping"></i> Ajouter panier
                      </button>
                    )}
                    {isVendeur && (
                      <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                        <i className="fa-solid fa-trash"></i> Supprimer
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        {/* ===== FORM (vendeur uniquement) ===== */}
        {showForm && isVendeur && (
          <div className="form-box">
            <label htmlFor="nom-part">Nom du produit</label>
            <input id="nom-part" placeholder="Nom du produit"
              value={newPart.nom}
              onChange={(e) => setNewPart({ ...newPart, nom: e.target.value })}
            />
            <label htmlFor="pseudo-part">Pseudo / Vendeur</label>
            <input id="pseudo-part" placeholder="Votre pseudo"
              value={newPart.pseudo}
              onChange={(e) => setNewPart({ ...newPart, pseudo: e.target.value })}
            />
            <label htmlFor="prix-part">Prix</label>
            <input id="prix-part" placeholder="Prix (ex: 150 000 Ar)"
              value={newPart.prix}
              onChange={(e) => setNewPart({ ...newPart, prix: e.target.value })}
            />
            <label htmlFor="etat-part">État</label>
            <select id="etat-part" value={newPart.etat}
              onChange={(e) => setNewPart({ ...newPart, etat: e.target.value })}
            >
              <option value="Neuf">Neuf</option>
              <option value="Occasion">Occasion</option>
            </select>
            <label htmlFor="contact-part">Contact</label>
            <input id="contact-part" placeholder="Contact (ex: 034 xx xxx xx)"
              value={newPart.contact}
              onChange={(e) => setNewPart({ ...newPart, contact: e.target.value })}
            />
            <label htmlFor="sousType-part">Type spécifique</label>
            <select id="sousType-part" value={newPart.sousType}
              onChange={(e) => setNewPart({ ...newPart, sousType: e.target.value })}
            >
              {sousCategories[categorie].slice(1).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button className="card-btn" onClick={handleAdd}>
              <i className="fa-solid fa-check"></i> Publier
            </button>
          </div>
        )}
        {from === "offres" && (isVendeur || isAdmin) && (
          <button
            className="add-offer-btn"
            onClick={() => {
              if (!user) { addToast("Veuillez vous connecter !", "error"); navigate("/login"); return; }
              setShowForm(true);
            }}
          >
            Ajouter produit
          </button>
        )}

        {from === "recherche" && (
          <button
            className="add-offer-btn"
            onClick={() => {
              if (!user) { addToast("Veuillez vous connecter !", "error"); navigate("/login"); return; }
              navigate("/demandeproduit");
            }}
          >
            Ajouter demande
          </button>
        )}

        {!from && isVendeur && (
          <button
            className="add-offer-btn"
            onClick={() => setShowForm(true)}
          >
            Ajouter produit
          </button>
        )}

        {!from && isAcheteur && (
          <button
            className="add-offer-btn"
            onClick={() => navigate("/demandeproduit")}
          >
            Ajouter demande
          </button>
        )}
      </div>

      <Footer />
    </>
  );
}