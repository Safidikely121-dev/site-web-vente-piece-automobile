import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import "./Entreprises.css";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import useTitle from "../hooks/useTitle";
import { useToast } from "../context/ToastContext";
import "../styles/Global.css";

export default function ProduitsDynamique() {
  const navigate = useNavigate();
  const { categorierech } = useParams();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  const addFlag = new URLSearchParams(window.location.search).get('add');

  const { user, isLoggedIn } = useAuth();
  const role = user?.role;

  useTitle(`Produits - ${categorierech ?? ""}`);


  const { addToast } = useToast();
  const { cart, addToCart, removeFromCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);

  const [shouldAutoOpenAddForm, setShouldAutoOpenAddForm] = useState(false);

  // Local UI ajoute produit (annonce)

  const [searchQuery, setSearchQuery] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [nom, setNom] = useState("");
  const [etat, setEtat] = useState("");
  const [prix, setPrix] = useState("");
  const [contact, setContact] = useState("");

  // Recherche intelligente (IA) : recherche en langage naturel
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState(null); // null = pas de recherche IA active
  const [aiSearchInterpretation, setAiSearchInterpretation] = useState(null);

  // Assistance vendeur (IA) : génération de description
  const [aiDescLoading, setAiDescLoading] = useState(false);


  // Ajouts local (avant sauvegarde backend) - pour ne pas dépendre d'un endpoint non prévu
  const [addedProducts, setAddedProducts] = useState([]);

  // Produits persistés (backend)
  const [persistedProducts, setPersistedProducts] = useState([]);


  useEffect(() => {
    if (user && !pseudo) setPseudo(user.pseudo);
  }, [user, pseudo]);

  useEffect(() => {
    if (addFlag === '1' && isLoggedIn) {
      setShouldAutoOpenAddForm(true);
    }
  }, [addFlag, isLoggedIn]);

  useEffect(() => {

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        if (!categorierech) {
          setProducts([]);
          return;
        }

        // On suppose que le backend a un endpoint pour récupérer les produits par nom.
        // Le token est envoyé si présent : un vendeur connecté ne verra que ses propres produits.
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/products/category/${encodeURIComponent(String(categorierech))}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Erreur HTTP: ${res.status}`);
        }

        // Selon implémentation backend, on reçoit directement la liste.
        const data = await res.json();
        const arr = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
        setProducts(arr);
      } catch (e) {
        setError(e?.message || "Impossible de charger les produits");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [categorierech]);

  const visibleProducts = useMemo(() => {
    // Si une recherche intelligente (IA) est active, on affiche ses résultats
    if (aiSearchResults) {
      return aiSearchResults.map((p) => ({
        cartId: undefined,
        id: p.id,
        nom: p.nom ?? "Produit",
        image: p.image ?? p?.category?.image ?? "",
        prix: p.prix ?? "",
        type: p?.category?.name ?? categorierech,
        etat: p.etat ?? p?.description ?? "",
        contact: p.contact ?? "",
        userId: p.userId, // pour vérifier la propriété du produit
      }));
    }

    const base = products.map((p) => ({
      cartId: undefined,
      id: p.id,
      nom: p.nom ?? p.name ?? "Produit",
      image: p.image ?? p?.category?.image ?? "",
      prix: p.prix ?? "",
      type: p?.category?.name ?? categorierech,
      etat: p.etat ?? p?.description ?? "",
      contact: p.contact ?? "",
      userId: p.userId, // pour vérifier la propriété du produit
    }));

    const combined = [...addedProducts, ...base];

    if (!searchQuery.trim()) return combined;

    const q = searchQuery.toLowerCase();
    return combined.filter((p) => {
      return (
        String(p.nom ?? "").toLowerCase().includes(q) ||
        String(p.type ?? "").toLowerCase().includes(q) ||
        String(p.prix ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, addedProducts, searchQuery, categorierech, aiSearchResults]);

  // Recherche intelligente (IA) : phrase en langage naturel -> critères + résultats
  const handleAiSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setAiSearchResults(null);
      setAiSearchInterpretation(null);
      return;
    }

    setAiSearchLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      const data = await res.json();
      setAiSearchResults(Array.isArray(data.results) ? data.results : []);
      setAiSearchInterpretation(data.interpreted || null);
    } catch (err) {
      addToast(
        err?.message || "Recherche intelligente indisponible, recherche classique utilisée.",
        "error",
      );
      setAiSearchResults(null);
      setAiSearchInterpretation(null);
    } finally {
      setAiSearchLoading(false);
    }
  };

  const clearAiSearch = () => {
    setAiSearchResults(null);
    setAiSearchInterpretation(null);
    setSearchQuery("");
  };

  // Assistance vendeur (IA) : génère une description à partir des champs déjà remplis
  const handleGenerateDescription = async () => {
    if (!nom.trim()) {
      addToast("Renseignez d'abord le nom du produit.", "error");
      return;
    }

    setAiDescLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nom: nom.trim(),
          marque: pseudo?.trim() || undefined,
          categorierech,
          etat: etat?.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      const data = await res.json();
      if (data.description) {
        setEtat(data.description);
        addToast("Description générée par l'IA !", "success");
      }
    } catch (err) {
      addToast(err?.message || "Impossible de générer la description.", "error");
    } finally {
      setAiDescLoading(false);
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      addToast("Veuillez vous connecter !", "error");
      navigate("/login");
      return;
    }

    if (![nom, etat, prix, contact].every((x) => String(x ?? "").trim().length > 0)) {
      addToast("Veuillez remplir tous les champs.", "error");
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
          nom: nom.trim(),
          prix: prix.trim(),
          marque: pseudo?.trim() || undefined,
          description: etat.trim(),
          etat: etat.trim(),
          contact: contact.trim(),
          categoryName: categorierech,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erreur HTTP: ${res.status}`);
      }

      addToast("Produit ajouté !", "success");

      setNom("");
      setEtat("");
      setPrix("");
      setContact("");
      setAiSearchResults(null);
      setAiSearchInterpretation(null);

      // Reload backend products
      const token2 = localStorage.getItem("token");
      const res2 = await fetch(`/api/products/category/${encodeURIComponent(String(categorierech))}`, {
        headers: token2 ? { Authorization: `Bearer ${token2}` } : {},
      });
      const data = await res2.json();
      const arr = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
      setProducts(arr);

      setAddedProducts([]);
    } catch (err) {
      addToast(err?.message || "Impossible d'ajouter le produit", "error");
    }
  };


  const handleAddToCart = (p) => {
    addToCart(p);
    addToast(`"${p.nom}" ajouté au panier !`, "success");
  };

  // (reloadProducts défini plus bas)

  const handleDeleteLocalAdded = (id) => {
    setAddedProducts((prev) => prev.filter((x) => x.id !== id));
  };

  // Seul le vendeur propriétaire (ou un administrateur) peut gérer un produit.
  const canManageProduct = (p) =>
    role === "admin_technique" ||
    role === "admin_commercial" ||
    (role === "vendeur" &&
      (p.userId === user?.id || addedProducts.some((x) => x.id === p.id)));

  const reloadProducts = async () => {
    if (!categorierech) return;
    const token = localStorage.getItem("token");
    const res2 = await fetch(
      `/api/products/category/${encodeURIComponent(String(categorierech))}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    const data = await res2.json();
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data?.products)
        ? data.products
        : [];
    setProducts(arr);
  };

  const handleDeletePersisted = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erreur HTTP: ${res.status}`);
      }

      addToast("Produit supprimé !", "success");

      await reloadProducts();
    } catch (err) {
      addToast(err?.message || "Impossible de supprimer le produit", "error");
    }
  };

  return (
    <>
      <Nav />
      <div className="container">
        <h2 className="title">
          <i className="fa-solid fa-boxes-stacked" /> Produits - {categorierech}
        </h2>

        {/* Search */}
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label htmlFor="search">
              <i className="fa-solid fa-magnifying-glass" /> Rechercher
              <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
                {" "}(ou décrivez la pièce en langage naturel)
              </span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (aiSearchResults) {
                    setAiSearchResults(null);
                    setAiSearchInterpretation(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAiSearch();
                  }
                }}
                type="text"
                placeholder='ex: "phare avant pour Toyota Corolla"'
                style={{ width: "100%" }}
              />
              <button
                type="button"
                className="card-btn"
                onClick={handleAiSearch}
                disabled={aiSearchLoading || !searchQuery.trim()}
                title="Recherche intelligente (IA)"
                style={{ whiteSpace: "nowrap" }}
              >
                {aiSearchLoading ? (
                  <i className="fa-solid fa-spinner fa-spin" />
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles" /> IA
                  </>
                )}
              </button>
            </div>

            {aiSearchInterpretation && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <i className="fa-solid fa-sparkles" /> Recherche interprétée :
                {aiSearchInterpretation.marque && (
                  <strong>Marque « {aiSearchInterpretation.marque} »</strong>
                )}
                {aiSearchInterpretation.categorie && (
                  <strong>Catégorie « {aiSearchInterpretation.categorie} »</strong>
                )}
                {aiSearchInterpretation.motsCles?.length > 0 && (
                  <span>Mots-clés : {aiSearchInterpretation.motsCles.join(", ")}</span>
                )}
                <button
                  type="button"
                  onClick={clearAiSearch}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Réinitialiser
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ajouter produit (bouton + formulaire) */}
        {(!from || from === "offres") && isLoggedIn && role === "vendeur" ? (
          <section style={{ maxWidth: 720, margin: "18px auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <h3 style={{ margin: 0 }}>
                <i className="fa-solid fa-box-open" /> Ajouter un produit
              </h3>
            </div>

            <details
              style={{ marginTop: 10 }}
              open={shouldAutoOpenAddForm}
              onToggle={(e) => {
                if (e.target?.open) setShouldAutoOpenAddForm(true);
                else setShouldAutoOpenAddForm(false);
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 800 }}>
                Ajouter / remplir le formulaire
              </summary>


              <div className="form-box" style={{ marginTop: 12 }}>
                <form onSubmit={handleAddAnnouncement}>

                  <label htmlFor="nom">Nom</label>
                  <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />

                  <label htmlFor="etat">
                    État / Description
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <input
                      id="etat"
                      value={etat}
                      onChange={(e) => setEtat(e.target.value)}
                      required
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="card-btn"
                      onClick={handleGenerateDescription}
                      disabled={aiDescLoading || !nom.trim()}
                      title="Générer une description avec l'IA"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {aiDescLoading ? (
                        <i className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        <>
                          <i className="fa-solid fa-wand-magic-sparkles" /> Générer
                        </>
                      )}
                    </button>
                  </div>

                  <label htmlFor="prix">Prix</label>
                  <input id="prix" value={prix} onChange={(e) => setPrix(e.target.value)} required />

                  <label htmlFor="contact">Contact</label>
                  <input
                    id="contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                  />

                  <button type="submit" className="card-btn" style={{ width: "100%" }}>
                    Publier
                  </button>
                </form>
              </div>
            </details>
          </section>
        ) : null}

        {!loading && error && (
          <p style={{ textAlign: "center", color: "#b00" }}>{error}</p>
        )}

        {loading ? (
          <p style={{ textAlign: "center" }}>Chargement...</p>
        ) : (
          <section style={{ marginTop: 18 }}>
            <div className="grid">
              {visibleProducts.length === 0 ? (
                <p style={{ textAlign: "center" }}>Aucun produit.</p>
              ) : (
                visibleProducts.map((p) => (
                  <div key={String(p.id ?? p.nom)} className="product-card">
                    {p.image ? (
                      <img src={p.image} alt={p.nom} className="product-img" />
                    ) : (
                      <div className="product-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        Sans image
                      </div>
                    )}

                    <h3>{p.nom}</h3>
                    {p.type && <p>Catégorie : <strong>{p.type}</strong></p>}
                    {p.prix && <p className="product-price">{p.prix}</p>}

                    <div className="btn-group">
                      {from === "recherche" ? (
                        <button className="card-btn" onClick={() => {
                          if (!user) { addToast("Veuillez vous connecter !", "error"); navigate("/login"); return; }
                          handleAddToCart(p);
                        }}>
                          <i className="fa-solid fa-cart-shopping"></i> Ajouter au panier
                        </button>
                      ) : from === "offres" ? (
                        canManageProduct(p) ? (
                          <button
                            className="delete-btn"
                            onClick={() => {
                              if (!user) { addToast("Veuillez vous connecter !", "error"); navigate("/login"); return; }
                              const isLocal = addedProducts.some((x) => x.id === p.id);
                              if (isLocal) handleDeleteLocalAdded(p.id);
                              else handleDeletePersisted(p.id);
                            }}
                            title="Supprimer"
                          >
                            <i className="fa-solid fa-trash"></i> Supprimer
                          </button>
                        ) : null
                      ) : (
                        <>
                          {role === "acheteur" && (
                            <button className="card-btn" onClick={() => handleAddToCart(p)}>
                              <i className="fa-solid fa-cart-shopping"></i> Ajouter au panier
                            </button>
                          )}

                          {canManageProduct(p) ? (
                            <button
                              className="delete-btn"
                              onClick={() => {
                                const isLocal = addedProducts.some((x) => x.id === p.id);
                                if (isLocal) handleDeleteLocalAdded(p.id);
                                else handleDeletePersisted(p.id);
                              }}
                              title="Supprimer"
                            >
                              <i className="fa-solid fa-trash"></i> Supprimer
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
}

