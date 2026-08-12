import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "../styles/Categorie.css";
import "../styles/Boutton.css";
import "../styles/Global.css";
import "../styles/Recherche.css";

const categoryEmojis = {
  "Moteur": "⚙️",
  "Freinage": "🛑",
  "Suspension": "🔄",
  "Éclairage": "💡",
  "Intérieur et carrosserie": "🚗",
  "Roue": "⚪",
  "Système de transmission": "⛓️",
  "Systèmes de refroidissement": "❄️",
  "Admission et échappement": "💨",
  "Pièce moteur": "⚙️",
  "Système de freinage": "🛑",
  "Suspension et direction": "🔄",
  "Éclairage et signalisation": "💡",
  "Turbo": "🌀",
  "Vilebrequin": "🔩",
  "Joint": "🔧",
  "Arbre": "📏",
  "Pompe": "💧",
  "Radiateur": "🌡️",
  "Démarreur": "🔋",
  "Alternateur": "🔌",
  "Capteur": "📡",
  "Enjoliveur": "💿",
  "Moyeu": "🎯",
  "Pneu": "🔘",
  "Jante": "🛞",
  "Valve": "🔛",
  "Embrayage": "🔄",
  "Boîte de vitesses": "⚡",
  "Cardan": "🔗",
};

const colorPairs = [
  { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" },
  { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
  { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
  { bg: "#f5f3ff", text: "#5b21b6", border: "#ddd6fe" },
  { bg: "#ecfeff", text: "#155e75", border: "#a5f3fc" },
  { bg: "#fdf4ff", text: "#86198f", border: "#f5d0fe" },
  { bg: "#f0fdfa", text: "#115e59", border: "#99f6e4" },
];

export default function Categories() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entreprise } = useParams();
  const { user, isVendeur, isAcheteur, isTechnicalAdmin } = useAuth();

  const isOffresPath = location.pathname.startsWith("/categories/");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de charger les catégories");
        return res.json();
      })
      .then((data) => {
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.categories)
              ? data.categories
              : [];
        setCategories(arr);
      })
      .catch((e) => setError(e?.message || "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const mapping = {
    Moteur: "Pièce moteur",
    Freinage: "Système de freinage",
    Suspension: "Suspension et direction",
    "Éclairage": "Éclairage et signalisation",
    "Intérieur et carrosserie": "Intérieur et carrosserie",
    Roue: "Roue",
    "Système de transmission": "Système de transmission",
    "Systèmes de refroidissement": "Systèmes de refroidissement",
    "Admission et échappement": "Admission et échappement",
  };

  const handleDeleteCategory = async (c) => {
    const ok = window.confirm(`Supprimer la catégorie "${c.name}" ?`);
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      const idOrName = c.id ?? c.name;
      const res = await fetch(
        `/api/categories/${encodeURIComponent(String(idOrName))}`,
        {
          method: "DELETE",
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erreur HTTP: ${res.status}`);
      }

      setCategories((prev) =>
        prev.filter((x) => String(x.id ?? x.name) !== String(idOrName))
      );
    } catch (err) {
      alert("Impossible de supprimer la catégorie.");
      console.error(err);
    }
  };

  return (
    <>
      <Nav />
      <div className="page page--categories">
        <div className="container">

          {/* ===== EN-TÊTE ===== */}
          <div className="categories-header">
            <h2 className="title">
              <i className="fa-solid fa-layer-group"></i>{" "}
              {entreprise ? `Catégories — ${entreprise}` : "Nos Catégories"}
            </h2>
            <p className="categories-subtitle">
              Explorez notre catalogue de pièces automobile par catégorie
            </p>
          </div>

          {/* ===== BARRE DE RECHERCHE — tous les utilisateurs ===== */}
          <div className="search-container" style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-btn" onClick={() => setSearch("")} style={{ marginLeft: 8 }}>
                ✖
              </button>
            )}
          </div>

          {/* ===== COMPTEUR DE RÉSULTATS ===== */}
          {!loading && !error && search && (
            <p className="categories-count">
              {filteredCategories.length} catégorie(s) trouvée(s)
            </p>
          )}

          {/* ===== GRILLE ===== */}
          {loading ? (
            <div className="categories-loading">
              <div className="spinner"></div>
              <p>Chargement des catégories...</p>
            </div>
          ) : error ? (
            <div className="categories-error">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="categories-empty">
              <i className="fa-solid fa-folder-open"></i>
              <p>Aucune catégorie ne correspond à votre recherche.</p>
              {search && (
                <button className="add-btn" onClick={() => setSearch("")}>
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <div className="categories-grid">
              {filteredCategories.map((c, index) => {
                const emoji = categoryEmojis[c.name] || "📦";
                const color = colorPairs[index % colorPairs.length];

                const handleClick = () => {
                  const routePart = mapping[c.name] ?? c.name;
                  const fromParam = isOffresPath ? "offres" : "recherche";
                  navigate(`/produits/${encodeURIComponent(routePart)}?from=${fromParam}`);
                };

                return (
                  <div key={c.id ?? c.name} className="cat-card-wrapper">
                    <button
                      className="cat-card-btn"
                      style={{
                        "--cat-bg": color.bg,
                        "--cat-text": color.text,
                        "--cat-border": color.border,
                      }}
                      onClick={handleClick}
                    >
                      <span className="cat-card-emoji">{emoji}</span>
                      <span className="cat-card-name">{c.name}</span>
                      <span className="cat-card-arrow">
                        <i className="fa-solid fa-arrow-right"></i>
                      </span>
                    </button>

                    {isOffresPath && isTechnicalAdmin && (
                      <button
                        className="cat-card-delete"
                        title="Supprimer catégorie"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) { navigate("/login"); return; }
                          handleDeleteCategory(c);
                        }}
                      >
                        <i className="fa-solid fa-trash"></i> Supprimer
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== ACTIONS EN BAS ===== */}
          {!loading && !error && (
            <div className="categories-actions">
              {isOffresPath && isTechnicalAdmin ? (
                <button
                  className="add-btn"
                  onClick={() => {
                    if (!user) { navigate("/login"); return; }
                    navigate("/ajouter-categorie");
                  }}
                >
                  <i className="fa-solid fa-plus"></i> Ajouter une catégorie
                </button>
              ) : (
                <button
                  className="add-btn"
                  onClick={() => {
                    if (!user) { navigate("/login"); return; }
                    navigate("/demandeproduit");
                  }}
                >
                  <i className="fa-solid fa-plus"></i> Ajouter une demande
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

