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
import "../styles/Recherche.css"

// ===== IMAGES =====
import filtreImg from "../assets/moteur.jpg";
import turboImg from "../assets/cylindre.jpg";
import carburImg from "../assets/piston.jpg";
import silencieuxImg from "../assets/soupape.jpg";
import tuyauImg from "../assets/valve.jpg";
import injecteurImg from "../assets/injecteur.jpg";

// ===== DATA INITIAL =====
const dataInitial = [
  { id: 1, nom: "Filtre à air moteur", image: filtreImg, prix: "35 000 Ar", type: "Filtre", sousType: "Air", etat: "Neuf", contact: "034 00 000 00" },
  { id: 2, nom: "Filtre à air cabine", image: filtreImg, prix: "45 000 Ar", type: "Filtre", sousType: "Cabine", etat: "Neuf", contact: "034 00 000 00" },
  { id: 3, nom: "Turbocompresseur", image: turboImg, prix: "850 000 Ar", type: "Turbo", sousType: "Variable", etat: "Neuf", contact: "034 00 000 00" },
  { id: 4, nom: "Compresseur", image: turboImg, prix: "600 000 Ar", type: "Compresseur", sousType: "Volume", etat: "Neuf", contact: "034 00 000 00" },
  { id: 5, nom: "Carburateur", image: carburImg, prix: "250 000 Ar", type: "Carburateur", sousType: "Double corps", etat: "Neuf", contact: "034 00 000 00" },
  { id: 6, nom: "Silencieux avant", image: silencieuxImg, prix: "200 000 Ar", type: "Silencieux", sousType: "Avant", etat: "Neuf", contact: "034 00 000 00" },
  { id: 7, nom: "Silencieux arrière", image: silencieuxImg, prix: "180 000 Ar", type: "Silencieux", sousType: "Arrière", etat: "Neuf", contact: "034 00 000 00" },
  { id: 8, nom: "Tuyau d'admission", image: tuyauImg, prix: "80 000 Ar", type: "Tuyau", sousType: "Admission", etat: "Neuf", contact: "034 00 000 00" },
  { id: 9, nom: "Collecteur d'échappement", image: injecteurImg, prix: "350 000 Ar", type: "Collecteur", sousType: "Échappement", etat: "Neuf", contact: "034 00 000 00" },
  { id: 10, nom: "Vanne EGR", image: tuyauImg, prix: "200 000 Ar", type: "Vanne", sousType: "Recirculation", etat: "Neuf", contact: "034 00 000 00" },
];

// ===== TYPES =====
const categories = ["Filtre", "Turbo", "Carburateur", "Silencieux", "Tuyau"];

// ===== SOUS-CATEGORIES =====
const sousCategories = {
  Filtre: ["Tous", "Air", "Cabine"],
  Turbo: ["Tous", "Variable", "Fixe"],
  Carburateur: ["Tous", "Double corps", "Simple"],
  Silencieux: ["Tous", "Avant", "Arrière"],
  Tuyau: ["Tous", "Admission", "Échappement"],
};

export default function Admission() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { subtype } = useParams();
  const { addToCart } = useCart();
  const { user, isVendeur, isAcheteur, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  

  const handleAddToCart = (p) => {
    if (!user) {
      addToast("Veuillez vous connecter !", "error");
      navigate("/login");
      return;
    }
    addToCart(p);
    addToast(`"${p.nom}" ajouté au panier !`, "success");
  };

const [pieces, setPieces] = useState(dataInitial);
  const [categorie, setCategorie] = useState(subtype || categories[0]);
  const [sousCat, setSousCat] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [newPart, setNewPart] = useState({
    nom: "",
    pseudo: "",
    prix: "",
    type: "Filtre",
    sousType: "Air",
    etat: "Neuf",
    contact: "",
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
          categoryName: "Admission et échappement",
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
        {
          id: savedProduct.id || Date.now(),
          ...newPart,
          image: filtreImg,
        },
      ]);
    } catch (error) {
      console.error("Erreur publication produit:", error);
      addToast("Erreur lors de la publication du produit", "error");
    }

    setShowForm(false);
    setNewPart({
      nom: "",
      pseudo: "",
      prix: "",
      type: "Filtre",
      sousType: "Air",
      etat: "Neuf",
      contact: "034 00 000 00",
    });
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
        <h2 className="title">💨 Admission</h2>

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
              <button key={cat} className="cat-btn" onClick={() => setCategorie(cat)}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ===== ETAPE 2: SOUS TYPE ===== */}
        {categorie && (
          <>
            <div className="categories">
              {sousCategories[categorie].map((s) => (
                <button
                  key={s}
                  className={`cat-btn ${sousCat === s ? "active" : ""}`}
                  onClick={() => setSousCat(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setCategorie(null);
                setSousCat("Tous");
              }}
              className="card-btn secondary"
            >
              <i className="fa-solid fa-arrow-left"></i> Retour
            </button>
          </>
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
              <p>
                👤 Vendeur : <strong>{p.pseudo || "Anonyme"}</strong>
              </p>
              <p>{p.sousType}</p>
              <p>
                État: <strong>{p.etat || "Neuf"}</strong>
              </p>
              <p>
                Contact: <strong>{p.contact || "030 00 000 00"}</strong>
              </p>
              <p>{p.prix}</p>

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

        {/* ===== FORM ===== */}
        {showForm && isVendeur && (
          <div className="form-box">
            <label htmlFor="nom-part">Nom du produit</label>
            <input
              id="nom-part"
              placeholder="Nom du produit"
              value={newPart.nom}
              onChange={(e) => setNewPart({ ...newPart, nom: e.target.value })}
            />

            <label htmlFor="pseudo-part">Pseudo / Vendeur</label>
            <input
              id="pseudo-part"
              placeholder="Votre pseudo"
              value={newPart.pseudo}
              onChange={(e) => setNewPart({ ...newPart, pseudo: e.target.value })}
            />

            <label htmlFor="prix-part">Prix</label>
            <input
              id="prix-part"
              placeholder="Prix (ex: 150 000 Ar)"
              value={newPart.prix}
              onChange={(e) => setNewPart({ ...newPart, prix: e.target.value })}
            />

            <label htmlFor="etat-part">État</label>
            <select
              id="etat-part"
              value={newPart.etat}
              onChange={(e) => setNewPart({ ...newPart, etat: e.target.value })}
            >
              <option value="Neuf">Neuf</option>
              <option value="Occasion">Occasion</option>
            </select>

            <label htmlFor="contact-part">Contact</label>
            <input
              id="contact-part"
              placeholder="Contact (ex: 034 xx xxx xx)"
              value={newPart.contact}
              onChange={(e) => setNewPart({ ...newPart, contact: e.target.value })}
            />

            <label htmlFor="sousType-part">Type spécifique</label>
            <select
              id="sousType-part"
              value={newPart.sousType}
              onChange={(e) => setNewPart({ ...newPart, sousType: e.target.value })}
            >
              {categorie && sousCategories[categorie].slice(1).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <button className="card-btn" onClick={handleAdd}>
              <i className="fa-solid fa-check"></i> Publier
            </button>
          </div>
        )}

        {/* ===== BOUTONS ACTIONS (page des produits) ===== */}
        {from === "offres" && (isVendeur || isAdmin) && (
          <button className="add-offer-btn" onClick={() => {
            if (!user) { addToast("Veuillez vous connecter !", "error"); navigate("/login"); return; }
            setShowForm(true);
          }}>
            Ajouter un produit
          </button>
        )}

        {from === "recherche" && (
          <button className="add-offer-btn" onClick={() => {
            if (!user) { addToast("Veuillez vous connecter !", "error"); navigate("/login"); return; }
            navigate("/demandeproduit");
          }}>
            Ajouter une demande
          </button>
        )}

        {!from && isVendeur && (
          <button className="add-offer-btn" onClick={() => setShowForm(true)}>
            Ajouter un produit
          </button>
        )}

        {!from && isAcheteur && (
          <button className="add-offer-btn" onClick={() => navigate("/demandeproduit")}>
            Ajouter une demande
          </button>
        )}
      </div>

      <Footer />
    </>
  );
}

