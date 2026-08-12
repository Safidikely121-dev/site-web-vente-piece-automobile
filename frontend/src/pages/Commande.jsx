/**
 * Page de recherche et d'ajout de produit

 *
 * Cette page remplace l'ancienne fonctionnalité de commande.
 * Elle propose :
 * - une recherche de pièces
 * - une section Ajouter produit
 * - un formulaire avec pseudo, état, prix et contact
 * - une validation qui nécessite une connexion
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Entreprises.css";
import "../styles/Global.css";
import "../styles/Boutton.css";

// Import images for sample parts
import pharesImg from "../assets/hero.png";
import amortImg from "../assets/amortisseur.jpg";
import disquefrein from "../assets/disquefrain.jpg";
import radiateur from "../assets/engine.jpg";
import moteurImg from "../assets/moteur.jpg";
import pneuImg from "../assets/pneu1.jpg";
import useTitle from "../hooks/useTitle";
import { useToast } from "../context/ToastContext";


const sampleParts = [
  { nom: "Phare avant gauche", type: "Éclairage", prix: "280 000 Ar", image: pharesImg },
  { nom: "Amortisseur avant", type: "Suspension", prix: "180 000 Ar", image: amortImg },
  { nom: "Disque de frein avant", type: "Freinage", prix: "200 000 Ar", image: disquefrein },
  { nom: "Radiateur moteur", type: "Refroidissement", prix: "280 000 Ar", image: radiateur },
  { nom: "Moteur Diesel", type: "Moteur", prix: "2 000 000 Ar", image: moteurImg },
  { nom: "Pneu Été", type: "Roue", prix: "250 000 Ar", image: pneuImg },
];

export default function Commande() {
  const { addToast } = useToast();
  useTitle("Recherche de pièces");
  const navigate = useNavigate();
  const { user, isLoggedIn, isVendeur, isAdmin } = useAuth();
  const { cart, addToCart, removeFromCart } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [etat, setEtat] = useState("");
  const [prix, setPrix] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [addedProducts, setAddedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);


  useEffect(() => {
    if (user && !pseudo) {
      setPseudo(user.pseudo);
    }
  }, [user, pseudo]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const token = localStorage.getItem("token");
        const res = await fetch("/api/products", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(await res.text().catch(() => String(res.status)));
        const data = await res.json();

        if (cancelled) return;

        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : Array.isArray(data?.data)
              ? data.data
              : [];

        // Normaliser pour que le rendu marche même si la structure change.
        const mapped = arr.map((p) => {
          const categoryName =
            p.categoryName ??
            p.category?.name ??
            p.category ??
            p.type ??
            "";

          // Some backends may return `type` as object or id; keep both raw+stringified.
          const typeValue = p.type ?? categoryName;

          return {
            id: p.id,
            nom: p.nom ?? p.name ?? "Produit",
            type: String(typeValue ?? ""),
            categoryName: String(categoryName ?? ""),
            prix: p.prix ?? p.price ?? "",
            image: p.image ?? "",
          };
        });


        setProducts(mapped);
      } catch (err) {
        console.error("[Commande] Impossible de charger les produits:", err);
        if (!cancelled) setProducts([]);
        // Optionnel : aide au debug (peut rester en console)
        // console.log('[Commande] backend response error', err);

      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredParts = useMemo(() => {
    // Important : la page doit toujours afficher des résultats quand on cherche.
    // Donc on filtre sur les champs déjà normalisés dans `products`.
    const q = searchQuery.trim().toLowerCase();

    if (!q) return products;

    return products.filter((part) => {
      const nom = String(part.nom ?? "").toLowerCase();
      const type = String(part.type ?? "").toLowerCase();
      const categoryName = String(part.categoryName ?? "").toLowerCase();
      const prix = String(part.prix ?? "").toLowerCase();

      return (
        nom.includes(q) ||
        type.includes(q) ||
        categoryName.includes(q) ||
        prix.includes(q)
      );
    });
  }, [searchQuery, products]);


  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      setMessage("Veuillez vous connecter avant d'ajouter un produit.");
      navigate("/login");
      return;
    }

    if (!pseudo.trim() || !etat.trim() || !prix.trim() || !contact.trim()) {
      setMessage("Veuillez remplir tous les champs du formulaire.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nom: pseudo.trim(),
          prix: prix.trim(),
          marque: user?.pseudo?.trim() || undefined,
          description: etat.trim(),
          etat: etat.trim(),
          contact: contact.trim(),
          categoryName: "Recherche de pièces",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erreur HTTP: ${res.status}`);
      }

      const savedProduct = await res.json();
      addToast("Produit publié avec succès !", "success");

      setAddedProducts((prev) => [
        {
          id: savedProduct.id || Date.now(),
          pseudo: pseudo.trim(),
          etat: etat.trim(),
          prix: prix.trim(),
          contact: contact.trim(),
        },
        ...prev,
      ]);
      setMessage("Produit ajouté avec succès.");

      setEtat("");
      setPrix("");
      setContact("");
    } catch (error) {
      console.error("Erreur publication produit:", error);
      addToast("Erreur lors de la publication du produit", "error");
    }
  };

  return (
    <>
      <Nav />
      <div className="container">
        <h2 className="title">Recherche d’offres</h2>
        <p className="description" style={{ color: "var(--text)" }}>
          Trouvez la pièce qu'il vous faut parmi notre catalogue ou ajoutez votre propre annonce.
        </p>

        {/* Section Recherche */}
        <section className="search-section">
          <div className="form-group">
            <label htmlFor="search"><i className="fa-solid fa-magnifying-glass"></i> Rechercher une offre</label>
            <input
              id="search"
              type="text"
              placeholder="Ex: disque, moteur, 200 000..."
              value={searchQuery}
              onChange={(e) => {
                // Toujours prendre la valeur texte brute
                setSearchQuery(e.target.value);
              }}
              autoComplete="off"
              style={{
                width: "100%",
                minWidth: 520,
                padding: "0.95rem 1.1rem",
                fontSize: "1.05rem",
                borderRadius: 14,
                border: "1px solid rgba(59,130,246,0.35)",
                background: "rgba(255,255,255,0.06)",
                color: "var(--text)",
              }}
            />
          </div>
        </section>

        {/* Résultats de recherche */}
        <section className="results-section">
          <h3>Résultats ({filteredParts.length} offre{filteredParts.length > 1 ? 's' : ''})</h3>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                maxWidth: 1200,
                margin: "0 auto",
                borderCollapse: "collapse",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
              }}
            >
              <thead>
                <tr>
                  <th style={{ padding: 12, borderBottom: "1px solid rgba(59,130,246,0.25)", textAlign: "left" }}>Produit</th>
                  <th style={{ padding: 12, borderBottom: "1px solid rgba(59,130,246,0.25)", textAlign: "left" }}>Catégorie</th>
                  <th style={{ padding: 12, borderBottom: "1px solid rgba(59,130,246,0.25)", textAlign: "left" }}>Prix</th>
                  <th style={{ padding: 12, borderBottom: "1px solid rgba(59,130,246,0.25)", textAlign: "left" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((part) => (
                  <tr key={String(part.id ?? part.nom)}>

                    <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img
                          src={part.image}
                          alt={part.nom}
                          style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, background: "rgba(255,255,255,0.2)" }}
                        />
                        <div style={{ fontWeight: 800 }}>{part.nom}</div>
                      </div>
                    </td>
                    <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.06)", color: "var(--muted)" }}>
                      {part.type}
                    </td>
                    <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 900, color: "var(--primary)" }}>
                      {part.prix}
                    </td>
                    <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <button
                        onClick={() => {
                          if (!isLoggedIn) { navigate('/login'); return; }
                          addToCart(part);
                          addToast("Produit ajouté au panier !");
                        }}
                        className="card-btn"
                        style={{ padding: "0.6rem 1rem" }}
                      >
                        <i className="fa-solid fa-cart-shopping"></i> Ajouter au panier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section Panier rapide */}
        {cart.length > 0 && (
          <section className="cart-section">
            <h3><i className="fa-solid fa-cart-shopping"></i> Panier rapide ({cart.length} article{cart.length > 1 ? 's' : ''})</h3>
            <div className="search-results">
              {cart.map((item) => (
                <div key={item.cartId} className="product-card cart-item">
                  <img src={item.image} alt={item.nom} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>{item.nom}</h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: "0" }}>
                      {item.type}
                    </p>
                    <p style={{ fontWeight: "bold", color: "var(--primary)", margin: "0.5rem 0 0 0" }}>
                      {item.prix}
                    </p>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => removeFromCart(item.cartId)}
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="center" style={{ marginTop: "1rem" }}>
              <button className="card-btn" onClick={() => navigate('/panier')}>
                Voir le panier complet ➔
              </button>
            </div>
          </section>
        )}

        {/* Boutons d'authentification pour ajouter un produit */}
        {!isLoggedIn && (
          <section className="auth-section">
            <div className="login-prompt">
              <h3>Pour ajouter votre propre annonce</h3>
              <p>Vous devez créer un compte ou vous connecter.</p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
                <button onClick={() => navigate('/login')} className="card-btn">
                  Se connecter
                </button>
                <button onClick={() => navigate('/login?register=true')} className="card-btn secondary">
                  Créer un compte
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Section Ajouter produit */}
        {isLoggedIn && (isVendeur || isAdmin) && (
          <section className="add-product-section">
            <h3><i className="fa-solid fa-pen-to-square"></i> Ajouter votre annonce</h3>
            <form className="order-form" onSubmit={handleAddProduct}>
              <div className="form-group">
                <label htmlFor="pseudo"><i className="fa-solid fa-user"></i> Pseudo</label>
                <input
                  id="pseudo"
                  type="text"
                  placeholder="Votre pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="etat"><i className="fa-solid fa-box"></i> État</label>
                <input
                  id="etat"
                  type="text"
                  placeholder="Neuf, occasion, reconditionné..."
                  value={etat}
                  onChange={(e) => setEtat(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prix"><i className="fa-solid fa-money-bill"></i> Prix</label>
                <input
                  id="prix"
                  type="text"
                  placeholder="Prix en Ariary (ex: 150 000 Ar)"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact"><i className="fa-solid fa-envelope"></i> Contact</label>
                <input
                  id="contact"
                  type="text"
                  placeholder="Téléphone ou email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="card-btn" style={{ width: "100%" }}>
                Publier l'annonce
              </button>

              {message && <p className="success-message">{message}</p>}
            </form>
          </section>
        )}

        {/* Produits ajoutés */}
        {addedProducts.length > 0 && (
          <section className="added-products-section">
            <h3>Vos annonces publiées</h3>
            <div className="search-results">
              {addedProducts.map((item) => (
                <div key={item.id} className="product-card">
                  <p><strong>Pseudo :</strong> {item.pseudo}</p>
                  <p><strong>État :</strong> {item.etat}</p>
                  <p><strong>Prix :</strong> {item.prix}</p>
                  <p><strong>Contact :</strong> {item.contact}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}