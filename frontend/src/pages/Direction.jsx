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
import cremaillereImg from "../assets/cremaillere.jpg";
import brasImg from "../assets/bras.jpg";
import volantImg from "../assets/volant.jpg";
import ressortImg from "../assets/ressort.jpg";

// ===== DATA INITIAL =====
const dataInitial = [
  { id: 1, nom: "Crémaillère de direction", image: cremaillereImg, prix: "650 000 Ar", type: "Crémaillère", sousType: "Assistance", etat: "Neuf", contact: "034 00 000 00" },
  { id: 2, nom: "Crémaillère manuelle", image: cremaillereImg, prix: "450 000 Ar", type: "Crémaillère", sousType: "Manuelle", etat: "Neuf", contact: "034 00 000 00" },
  { id: 3, nom: "Barre stabilisatrice", image: brasImg, prix: "120 000 Ar", type: "Barre", sousType: "Avant", etat: "Neuf", contact: "034 00 000 00" },
  { id: 4, nom: "Barre de direction", image: brasImg, prix: "150 000 Ar", type: "Barre", sousType: "Raccord", etat: "Neuf", contact: "034 00 000 00" },
  { id: 5, nom: "Volant sport", image: volantImg, prix: "250 000 Ar", type: "Volant", sousType: "Cuir", etat: "Neuf", contact: "034 00 000 00" },
  { id: 6, nom: "Volant standard", image: volantImg, prix: "180 000 Ar", type: "Volant", sousType: "Plastique", etat: "Neuf", contact: "034 00 000 00" },
  { id: 7, nom: "Ressort suspension avant", image: ressortImg, prix: "90 000 Ar", type: "Ressort", sousType: "Avant", etat: "Neuf", contact: "034 00 000 00" },
  { id: 8, nom: "Ressort suspension arrière", image: ressortImg, prix: "85 000 Ar", type: "Ressort", sousType: "Arrière", etat: "Neuf", contact: "034 00 000 00" },
  { id: 9, nom: "Pompe direction assistée", image: cremaillereImg, prix: "320 000 Ar", type: "Pompe", sousType: "Huile", etat: "Neuf", contact: "034 00 000 00" },
  { id: 10, nom: "Bielle de direction", image: brasImg, prix: "75 000 Ar", type: "Bielle", sousType: "Droite", etat: "Neuf", contact: "034 00 000 00" },
];

// ===== TYPES =====
const categories = ["Crémaillère", "Barre", "Volant", "Ressort", "Pompe"];

// ===== SOUS-CATEGORIES =====
const sousCategories = {
  Crémaillère: ["Tous", "Assistance", "Manuelle"],
  Barre: ["Tous", "Avant", "Raccord"],
  Volant: ["Tous", "Cuir", "Plastique"],
  Ressort: ["Tous", "Avant", "Arrière"],
  Pompe: ["Tous", "Huile"],
};

export default function Direction() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { subtype } = useParams();
  const { addToCart } = useCart();
  const { user, isVendeur, isAcheteur, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");

const [pieces, setPieces] = useState(dataInitial);
  const [categorie, setCategorie] = useState(subtype || categories[0]);
  const [sousCat, setSousCat] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newPart, setNewPart] = useState({
    nom: "",
    pseudo: "",
    prix: "",
    type: "Crémaillère",
    sousType: "Assistance", etat: "Neuf", contact: ""
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
          categoryName: "Suspension et direction",
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

      // Ajouter aussi en local pour affichage immédiat
      setPieces([
        ...pieces,
        {
          id: savedProduct.id || Date.now(),
          ...newPart,
          image: cremaillereImg,
        },
      ]);
    } catch (error) {
      console.error("Erreur publication produit:", error);
      addToast("Erreur lors de la publication du produit", "error");
    }

    setShowForm(false);
    setNewPart({ nom: "", pseudo: "", prix: "", type: "Crémaillère", sousType: "Assistance", etat: "Neuf", contact: "034 00 000 00" });
  };

  // ===== DELETE =====
  const handleDelete = (id) => {
    if (window.confirm("Supprimer ?")) {
      setPieces(pieces.filter((p) => p.id !== id));
    }
  };

  return (
    <>
      <Nav />

      <div className="container">
        <h2 className="title"><i className="fa-solid fa-dharmachakra"></i> Direction</h2>

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

        {/* ===== ETAPE 1: TYPE ===== */}
        {!categorie && (
          <div className="categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className="cat-btn"
                onClick={() => setCategorie(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ===== RETOUR À LA SÉLECTION DE CATÉGORIE ===== */}
        {categorie && (
          <button
            onClick={() => {
              setCategorie(null);
            }}
            className="card-btn secondary"
            style={{ marginBottom: "1rem" }}
          >
            <i className="fa-solid fa-arrow-left"></i> Retour
          </button>
        )}

        {/* ===== PRODUITS ===== */}
        <div className="grid">
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
              <p>{p.prix}</p>

              <div className="btn-group">
                {from === "recherche" ? (
                  <button className="card-btn" onClick={() => {
                    if (!user) { addToast("Veuillez vous connecter !", "error"); navigate("/login"); return; }
                    addToCart(p);
                    addToast("Produit ajouté au panier !");
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
                      <button className="card-btn" onClick={() => {
                        if (!user) { addToast("Veuillez vous connecter !", "error"); navigate("/login"); return; }
                        addToCart(p);
                        addToast("Produit ajouté au panier !");
                      }}>
                        <i className="fa-solid fa-cart-shopping"></i> Ajouter au panier
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

