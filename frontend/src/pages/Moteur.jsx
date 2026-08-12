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
import moteurImg from "../assets/moteur.jpg";
import pistonImg from "../assets/piston.jpg";
import cylindreImg from "../assets/cylindre.jpg";
import soupapeImg from "../assets/soupape.jpg";
import bougieImg from "../assets/bougie.jpg";
import injecteurImg from "../assets/injecteur.jpg";
import courroieImg from "../assets/courroi.jpg";
import useTitle from "../hooks/useTitle";

// ===== DATA INITIAL =====
const dataInitial = [
  { id: 1, nom: "Moteur Diesel", image: moteurImg, prix: "2 000 000 Ar", type: "Moteur", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 2, nom: "Moteur Essence", image: moteurImg, prix: "1 500 000 Ar", type: "Moteur", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 3, nom: "Piston Diesel", image: pistonImg, prix: "140 000 Ar", type: "Piston", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 4, nom: "Piston Essence", image: pistonImg, prix: "120 000 Ar", type: "Piston", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 5, nom: "Cylindre Diesel", image: cylindreImg, prix: "250 000 Ar", type: "Cylindre", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 6, nom: "Cylindre Essence", image: cylindreImg, prix: "200 000 Ar", type: "Cylindre", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 7, nom: "Soupape Diesel", image: soupapeImg, prix: "65 000 Ar", type: "Soupape", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 8, nom: "Soupape Essence", image: soupapeImg, prix: "50 000 Ar", type: "Soupape", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 9, nom: "Bougie préchauffage", image: bougieImg, prix: "25 000 Ar", type: "Bougie", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 10, nom: "Bougie allumage", image: bougieImg, prix: "15 000 Ar", type: "Bougie", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 11, nom: "Injecteur Diesel", image: injecteurImg, prix: "220 000 Ar", type: "Injecteur", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 12, nom: "Injecteur Essence", image: injecteurImg, prix: "180 000 Ar", type: "Injecteur", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 13, nom: "Courroie distribution", image: courroieImg, prix: "110 000 Ar", type: "Courroie", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 14, nom: "Courroie distribution", image: courroieImg, prix: "90 000 Ar", type: "Courroie", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 15, nom: "Turbo Diesel", image: moteurImg, prix: "1 800 000 Ar", type: "Turbo", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 16, nom: "Turbo Essence", image: moteurImg, prix: "1 500 000 Ar", type: "Turbo", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 17, nom: "Vilebrequin Diesel", image: pistonImg, prix: "950 000 Ar", type: "Vilebrequin", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 18, nom: "Vilebrequin Essence", image: pistonImg, prix: "750 000 Ar", type: "Vilebrequin", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 19, nom: "Joint de culasse", image: cylindreImg, prix: "85 000 Ar", type: "Joint", sousType: "Culasse", etat: "Neuf", contact: "034 00 000 00" },
  { id: 20, nom: "Arbre à cames Diesel", image: soupapeImg, prix: "680 000 Ar", type: "Arbre", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 21, nom: "Arbre à cames Essence", image: soupapeImg, prix: "580 000 Ar", type: "Arbre", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 22, nom: "Pompe à huile", image: injecteurImg, prix: "120 000 Ar", type: "Pompe", sousType: "Huile", etat: "Neuf", contact: "034 00 000 00" },
  { id: 23, nom: "Pompe à essence", image: injecteurImg, prix: "140 000 Ar", type: "Pompe", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 24, nom: "Radiateur moteur", image: courroieImg, prix: "320 000 Ar", type: "Radiateur", sousType: "Moteur", etat: "Neuf", contact: "034 00 000 00" },
  { id: 25, nom: "Démarreur Diesel", image: moteurImg, prix: "450 000 Ar", type: "Démarreur", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 26, nom: "Démarreur Essence", image: moteurImg, prix: "380 000 Ar", type: "Démarreur", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
  { id: 27, nom: "Alternateur Diesel", image: moteurImg, prix: "350 000 Ar", type: "Alternateur", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" },
  { id: 28, nom: "Alternateur Essence", image: moteurImg, prix: "290 000 Ar", type: "Alternateur", sousType: "Essence", etat: "Neuf", contact: "034 00 000 00" },
];

// ===== TYPES =====
const categories = ["Moteur", "Piston", "Cylindre", "Soupape", "Bougie", "Injecteur", "Courroie", "Turbo", "Vilebrequin", "Joint", "Arbre", "Pompe", "Radiateur", "Démarreur", "Alternateur"];

// ===== SOUS-CATEGORIES =====
const sousCategories = {
  Moteur: ["Tous", "Diesel", "Essence"],
  Piston: ["Tous", "Diesel", "Essence"],
  Cylindre: ["Tous", "Diesel", "Essence"],
  Soupape: ["Tous", "Diesel", "Essence"],
  Bougie: ["Tous", "Diesel", "Essence"],
  Injecteur: ["Tous", "Diesel", "Essence"],
  Courroie: ["Tous", "Diesel", "Essence"],
  Turbo: ["Tous", "Diesel", "Essence"],
  Vilebrequin: ["Tous", "Diesel", "Essence"],
  Joint: ["Tous", "Culasse"],
  Arbre: ["Tous", "Diesel", "Essence"],
  Pompe: ["Tous", "Huile", "Essence"],
  Radiateur: ["Tous", "Moteur"],
  Démarreur: ["Tous", "Diesel", "Essence"],
  Alternateur: ["Tous", "Diesel", "Essence"],
};

export default function Moteur() {
  const { addToast } = useToast();
  useTitle("Pièces Moteur");
  const navigate = useNavigate();
  const { subtype } = useParams();
  const { addToCart } = useCart();
  const { user, isVendeur, isAcheteur, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");

  // Règles demandées :
  // - Vendeur: + Ajouter un produit, Supprimer (pas panier/demande)
  // - Acheteur: Ajouter au panier, Ajouter une demande (pas vendeur)

const [pieces, setPieces] = useState(dataInitial);
  const [categorie, setCategorie] = useState(subtype || categories[0]);
  const [sousCat, setSousCat] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [newPart, setNewPart] = useState({
    nom: "",
    pseudo: "",
    prix: "",
    type: "Moteur",
    sousType: "Diesel", etat: "Neuf", contact: ""
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
          categoryName: "Moteur",
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
          image: moteurImg,
        },
      ]);
    } catch (error) {
      console.error("Erreur publication produit:", error);
      addToast("Erreur lors de la publication du produit", "error");
    }

    setShowForm(false);
    setNewPart({ nom: "", pseudo: "", prix: "", type: "Moteur", sousType: "Diesel", etat: "Neuf", contact: "034 00 000 00" });
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
        <h2 className="title"><i className="fa-solid fa-gear"></i> Moteur</h2>

        {/* Barre de recherche — acheteur / visiteur */}
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
              <p>Sous-type : <strong>{p.sousType}</strong></p>
              <p>État : <strong>{p.etat || "Neuf"}</strong></p>
              <p>Contact : <strong>{p.contact || "034 00 000 00"}</strong></p>
              <p className="product-price">{p.prix}</p>

              <div className="btn-group">
                {from === "recherche" ? (
                  <button
                    className="card-btn"
                    onClick={() => {
                      if (!user) {
                        addToast("Veuillez vous connecter !", "error");
                        navigate("/login");
                        return;
                      }
                      addToCart(p);
                      addToast("Produit ajouté au panier !");
                    }}
                  >
                    <i className="fa-solid fa-cart-shopping"></i> Ajouter au panier
                  </button>
                ) : from === "offres" ? (
                  (isVendeur || isAdmin) ? (
                    <button
                      className="delete-btn"
                      onClick={() => {
                        if (!user) {
                          addToast("Veuillez vous connecter !", "error");
                          navigate("/login");
                          return;
                        }
                        handleDelete(p.id);
                      }}
                    >
                      <i className="fa-solid fa-trash"></i> Supprimer
                    </button>
                  ) : null
                ) : (
                  <>
                    {isAcheteur && (
                      <button
                        className="card-btn"
                        onClick={() => {
                          if (!user) {
                            addToast("Veuillez vous connecter !", "error");
                            navigate("/login");
                            return;
                          }
                          addToCart(p);
                          addToast("Produit ajouté au panier !");
                        }}
                      >
                        <i className="fa-solid fa-cart-shopping"></i> Ajouter au panier
                      </button>
                    )}
                    {isVendeur && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(p.id)}
                      >
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
              if (!user) {
                addToast("Veuillez vous connecter !", "error");
                navigate("/login");
                return;
              }
              setShowForm(true);
            }}
          >
            Ajouter un produit
          </button>
        )}

        {from === "recherche" && (
          <button
            className="add-offer-btn"
            onClick={() => {
              if (!user) {
                addToast("Veuillez vous connecter !", "error");
                navigate("/login");
                return;
              }
              navigate("/demandeproduit");
            }}
          >
            Ajouter une demande
          </button>
        )}

        {!from && isVendeur && (
          <button
            className="add-offer-btn"
            onClick={() => setShowForm(true)}
          >
            Ajouter un produit
          </button>
        )}

        {!from && isAcheteur && (
          <button
            className="add-offer-btn"
            onClick={() => navigate("/demandeproduit")}
          >
            Ajouter une demande
          </button>
        )}
      </div>

      <Footer />
    </>
  );
}
