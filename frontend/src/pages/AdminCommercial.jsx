import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useTitle from "../hooks/useTitle";
import "./AdminDashboard.css";
import "./AdminCommercial.css";

export default function AdminCommercial() {
  const { addToast } = useToast();
  useTitle("Administration commerciale - AutoParts");
  const navigate = useNavigate();
  const { user, isCommercialAdmin, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");

  useEffect(() => {
    if (user && !isCommercialAdmin) {
      navigate("/admin/login", { replace: true });
    }
  }, [user, isCommercialAdmin, navigate]);

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, demandesRes] = await Promise.all([
        fetch("/api/orders", { headers }),
        fetch("/api/products", { headers }),
        fetch("/api/demandes", { headers }),
      ]);

      const ordersData = ordersRes.ok ? await ordersRes.json() : [];
      const productsData = productsRes.ok ? await productsRes.json() : [];
      const demandesData = demandesRes.ok ? await demandesRes.json() : [];

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setDemandes(Array.isArray(demandesData) ? demandesData : []);
    } catch (err) {
      console.error("Erreur chargement admin commercial:", err);
      addToast("Erreur lors du chargement des données", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCommercialAdmin) return;
    loadData();
  }, [isCommercialAdmin]);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (tab === "insights" && !insights && !insightsLoading) {
      loadInsights();
    }
  };

  const loadInsights = async () => {
    setInsightsLoading(true);
    setInsightsError("");
    try {
      const res = await fetch("/api/ai/demandes/insights", { headers });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      setInsightsError(err?.message || "Impossible de charger les insights IA.");
    } finally {
      setInsightsLoading(false);
    }
  };

  const toggleDelivery = async (orderId, currentStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/delivery`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ delivered: !currentStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, delivered: !currentStatus } : o))
        );
        addToast(`Commande #${orderId} ${!currentStatus ? "marquée livrée" : "marquée non livrée"}`, "success");
      } else {
        addToast("Erreur lors de la mise à jour", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    }
  };

  const deleteOrder = async (orderId, orderClient) => {
    if (!window.confirm(`Supprimer la commande #${orderId} (${orderClient}) ?`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        addToast("Commande supprimée", "success");
      } else {
        addToast("Erreur lors de la suppression", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Supprimer le produit "${product.nom}" ?`)) return;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        addToast("Produit supprimé", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.message || "Erreur lors de la suppression", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div className="container center">
          <p>Chargement du tableau de bord commercial...</p>
        </div>
        <Footer />
      </>
    );
  }

  const pendingOrders = orders.filter((o) => !o.delivered).length;
  const totalSales = orders.reduce((sum, o) => sum + (Number(String(o.prix).replace(/[^\d.]/g, "")) || 0), 0);

  return (
    <>
      <Nav />
      <div className="admin-dashboard admin-commercial">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">
              <i className="fa-solid fa-chart-line"></i> Administration commerciale
            </h1>
            <p className="admin-subtitle">
              Gestion des produits, ventes, commandes, achats et suivi de l'activité commerciale.
            </p>
          </div>
          <div className="admin-header-actions">
            <span className="admin-badge-role">Connecté : {user?.pseudo || user?.email}</span>
            <button className="btn-small btn-danger-outline" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
            </button>
          </div>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <i className="fa-solid fa-box"></i>
            <div>
              <strong>{orders.length}</strong>
              <span>Commandes totales</span>
            </div>
          </div>
          <div className="stat-card warning">
            <i className="fa-solid fa-clock"></i>
            <div>
              <strong>{pendingOrders}</strong>
              <span>En attente de livraison</span>
            </div>
          </div>
          <div className="stat-card info">
            <i className="fa-solid fa-cubes"></i>
            <div>
              <strong>{products.length}</strong>
              <span>Produits en catalogue</span>
            </div>
          </div>
          <div className="stat-card secondary">
            <i className="fa-solid fa-headset"></i>
            <div>
              <strong>{demandes.length}</strong>
              <span>Demandes clients</span>
            </div>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            <i className="fa-solid fa-gauge-high"></i> Vue d'ensemble
          </button>
          <button className={`tab-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            <i className="fa-solid fa-box"></i> Commandes ({orders.length})
          </button>
          <button className={`tab-btn ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
            <i className="fa-solid fa-cubes"></i> Produits ({products.length})
          </button>
          <button className={`tab-btn ${activeTab === "demandes" ? "active" : ""}`} onClick={() => setActiveTab("demandes")}>
            <i className="fa-solid fa-headset"></i> Demandes clients ({demandes.length})
          </button>
          <button className={`tab-btn ${activeTab === "insights" ? "active" : ""}`} onClick={() => handleSelectTab("insights")}>
            <i className="fa-solid fa-wand-magic-sparkles"></i> Insights IA
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="admin-section">
            <h2>Vue d'ensemble commerciale</h2>
            <div className="admin-stats">
              <div className="stat-card">
                <i className="fa-solid fa-sack-dollar"></i>
                <div>
                  <strong>{totalSales.toLocaleString("fr-FR")} F</strong>
                  <span>Total des ventes</span>
                </div>
              </div>
              <div className="stat-card">
                <i className="fa-solid fa-truck-fast"></i>
                <div>
                  <strong>{orders.filter((o) => o.delivered).length}</strong>
                  <span>Commandes livrées</span>
                </div>
              </div>
            </div>
            <p className="empty-msg">
              Bienvenue dans l'espace d'administration commerciale. Consultez les
              commandes, la disponibilité des produits, les demandes clients et les
              statistiques de vente.
            </p>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="admin-section">
            <h2>Liste des commandes (ventes)</h2>
            {orders.length === 0 ? (
              <p className="empty-msg">Aucune commande pour le moment.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Client</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Adresse</th>
                      <th>Produit</th>
                      <th>Prix</th>
                      <th>Paiement</th>
                      <th>Date</th>
                      <th>Livrée</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className={order.delivered ? "row-delivered" : ""}>
                        <td>{order.id}</td>
                        <td>{order.client}</td>
                        <td>{order.email}</td>
                        <td>{order.telephone}</td>
                        <td>{order.adresse || "-"}</td>
                        <td>{order.produit}</td>
                        <td>{order.prix}</td>
                        <td>{order.paiement}</td>
                        <td>{order.date ? new Date(order.date).toLocaleDateString() : "-"}</td>
                        <td>
                          <span className={`badge ${order.delivered ? "badge-success" : "badge-warning"}`}>
                            {order.delivered ? "Oui" : "Non"}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button
                              className={`btn-small ${order.delivered ? "btn-warning" : "btn-success"}`}
                              onClick={() => toggleDelivery(order.id, order.delivered)}
                            >
                              {order.delivered ? "Annuler" : "Livrer"}
                            </button>
                            <button
                              className="btn-small btn-danger-outline"
                              onClick={() => deleteOrder(order.id, order.client)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div className="admin-section">
            <h2>Produits & disponibilité</h2>
            {products.length === 0 ? (
              <p className="empty-msg">Aucun produit en catalogue.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Marque</th>
                      <th>Prix</th>
                      <th>État</th>
                      <th>Vendeur</th>
                      <th>Disponible</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.nom}</td>
                        <td>{p.category?.name || "-"}</td>
                        <td>{p.marque || "-"}</td>
                        <td>{p.prix}</td>
                        <td>{p.etat || "-"}</td>
                        <td>{p.vendeur?.pseudo || "-"}</td>
                        <td>
                          <span className="badge badge-success">Disponible</span>
                        </td>
                        <td>
                          <button className="btn-small btn-danger-outline" onClick={() => deleteProduct(p)}>
                            <i className="fa-solid fa-trash"></i> Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "demandes" && (
          <div className="admin-section">
            <h2>Demandes des clients</h2>
            {demandes.length === 0 ? (
              <p className="empty-msg">Aucune demande client pour le moment.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Pseudo</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Marque</th>
                      <th>Catégorie</th>
                      <th>Produit</th>
                      <th>Qté</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandes.map((d) => (
                      <tr key={d.id}>
                        <td>{d.id}</td>
                        <td>{d.pseudo || "-"}</td>
                        <td>{d.nom}</td>
                        <td>{d.email}</td>
                        <td>{d.telephone}</td>
                        <td>{d.marque}</td>
                        <td>{d.categorie}</td>
                        <td>{d.produit}</td>
                        <td>{d.quantite}</td>
                        <td>{d.date ? new Date(d.date).toLocaleDateString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "insights" && (
          <div className="admin-section">
            <h2>
              <i className="fa-solid fa-wand-magic-sparkles" /> Analyse IA des demandes clients
            </h2>

            {insightsLoading && <p className="empty-msg">Analyse en cours...</p>}

            {!insightsLoading && insightsError && (
              <p className="empty-msg" style={{ color: "#b00" }}>
                {insightsError}
              </p>
            )}

            {!insightsLoading && !insightsError && insights && (
              <>
                <div className="admin-stats" style={{ marginBottom: 20 }}>
                  <div className="stat-card">
                    <strong>{insights.stats.totalCount}</strong>
                    <span>Demandes au total</span>
                  </div>
                  <div className="stat-card warning">
                    <strong>{insights.stats.nonNotifieesCount}</strong>
                    <span>Encore non satisfaites</span>
                  </div>
                </div>

                <div style={{ background: "var(--surface-hover, #f8fafc)", border: "1px solid var(--border-light, rgba(37,99,235,.1))", borderRadius: 14, padding: 16, marginBottom: 24 }}>
                  <strong>
                    <i className="fa-solid fa-sparkles" /> Synthèse
                    {insights.source === "fallback" && " (sans IA configurée)"}
                  </strong>
                  <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{insights.summary}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <h3>Pièces les plus demandées</h3>
                    <ol>
                      {insights.stats.topProduits.length === 0 && <li>Aucune donnée.</li>}
                      {insights.stats.topProduits.map((p) => (
                        <li key={p.nom}>
                          {p.nom} — {p.count}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3>Catégories les plus demandées</h3>
                    <ol>
                      {insights.stats.topCategories.length === 0 && <li>Aucune donnée.</li>}
                      {insights.stats.topCategories.map((c) => (
                        <li key={c.nom}>
                          {c.nom} — {c.count}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3>Marques les plus demandées</h3>
                    <ol>
                      {insights.stats.topMarques.length === 0 && <li>Aucune donnée.</li>}
                      {insights.stats.topMarques.map((m) => (
                        <li key={m.nom}>
                          {m.nom} — {m.count}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
