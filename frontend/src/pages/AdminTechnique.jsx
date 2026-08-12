import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useTitle from "../hooks/useTitle";
import "./AdminDashboard.css";
import "./AdminTechnique.css";

export default function AdminTechnique() {
  const { addToast } = useToast();
  useTitle("Administration technique - AutoParts");
  const navigate = useNavigate();
  const { user, isTechnicalAdmin, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marques, setMarques] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [catForm, setCatForm] = useState({ name: "" });
  const [marqueForm, setMarqueForm] = useState({ nom: "", logo: "" });
  const [adminForm, setAdminForm] = useState({
    pseudo: "",
    email: "",
    password: "",
    adminRole: "admin_commercial",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && !isTechnicalAdmin) {
      navigate("/admin/login", { replace: true });
    }
  }, [user, isTechnicalAdmin, navigate]);

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, catsRes, marquesRes, notifsRes] = await Promise.all([
        fetch("/api/auth/users", { headers }),
        fetch("/api/categories"),
        fetch("/api/marques"),
        fetch("/api/notifications", { headers }),
      ]);

      const usersData = usersRes.ok ? await usersRes.json() : [];
      const catsData = catsRes.ok ? await catsRes.json() : [];
      const marquesData = marquesRes.ok ? await marquesRes.json() : [];
      const notifsData = notifsRes.ok ? await notifsRes.json() : [];

      setUsers(Array.isArray(usersData) ? usersData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
      setMarques(Array.isArray(marquesData) ? marquesData : []);
      setNotifications(Array.isArray(notifsData) ? notifsData : []);
    } catch (err) {
      console.error("Erreur chargement admin technique:", err);
      addToast("Erreur lors du chargement des données", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isTechnicalAdmin) return;
    loadData();
  }, [isTechnicalAdmin]);

  const toggleBlockUser = async (userId, currentBlocked) => {
    try {
      const res = await fetch(`/api/auth/users/${userId}/block`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ blocked: !currentBlocked }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, blocked: !currentBlocked } : u))
        );
        addToast(`Utilisateur ${!currentBlocked ? "bloqué" : "débloqué"}`, "success");
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.message || "Erreur", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Supprimer l'utilisateur ${userEmail} ?`)) return;
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        addToast("Utilisateur supprimé", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.message || "Erreur", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    }
  };

  const createCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return addToast("Nom de catégorie requis.", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: catForm.name.trim() }),
      });
      if (res.ok) {
        addToast("Catégorie ajoutée", "success");
        setCatForm({ name: "" });
        const data = await fetch("/api/categories").then((r) => r.json());
        setCategories(Array.isArray(data) ? data : []);
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.message || "Erreur", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie "${cat.name}" ?`)) return;
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        addToast("Catégorie supprimée", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.message || "Erreur", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    }
  };

  const createMarque = async (e) => {
    e.preventDefault();
    if (!marqueForm.nom.trim()) return addToast("Nom de marque requis.", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/marques", {
        method: "POST",
        headers,
        body: JSON.stringify({ nom: marqueForm.nom.trim(), logo: marqueForm.logo.trim() || undefined }),
      });
      if (res.ok) {
        addToast("Marque ajoutée", "success");
        setMarqueForm({ nom: "", logo: "" });
        const data = await fetch("/api/marques").then((r) => r.json());
        setMarques(Array.isArray(data) ? data : []);
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.message || "Erreur", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteMarque = async (m) => {
    if (!window.confirm(`Supprimer la marque "${m.nom}" ?`)) return;
    try {
      const res = await fetch(`/api/marques/${m.id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setMarques((prev) => prev.filter((x) => x.id !== m.id));
        addToast("Marque supprimée", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.message || "Erreur", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    const { pseudo, email, password, adminRole } = adminForm;
    if (!pseudo.trim() || !email.trim() || !password.trim()) {
      return addToast("Veuillez remplir tous les champs.", "error");
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/admin/register", {
        method: "POST",
        headers,
        body: JSON.stringify({
          pseudo: pseudo.trim(),
          email: email.trim(),
          password,
          adminRole,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        addToast("Compte administrateur créé", "success");
        setAdminForm({ pseudo: "", email: "", password: "", adminRole: "admin_commercial" });
        const usersData = await fetch("/api/auth/users", { headers }).then((r) => r.json());
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        addToast(data.message || "Erreur lors de la création", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    } finally {
      setSaving(false);
    }
  };

  const markNotifRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}/lu`, { method: "PATCH", headers });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
      }
    } catch {
      // silencieux
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
          <p>Chargement du tableau de bord technique...</p>
        </div>
        <Footer />
      </>
    );
  }

  const admins = users.filter((u) => u.role === "admin_technique" || u.role === "admin_commercial");
  const nonAdmins = users.filter((u) => u.role !== "admin_technique" && u.role !== "admin_commercial");
  const nonLu = notifications.filter((n) => !n.lu).length;

  const roleLabel = (role) =>
    role === "admin_technique"
      ? "Admin technique"
      : role === "admin_commercial"
        ? "Admin commercial"
        : role === "vendeur"
          ? "Vendeur"
          : "Acheteur";

  return (
    <>
      <Nav />
      <div className="admin-dashboard admin-technique">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">
              <i className="fa-solid fa-gears"></i> Administration technique
            </h1>
            <p className="admin-subtitle">
              Gestion des utilisateurs, catégories, marques, paramètres et du fonctionnement du site.
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
            <i className="fa-solid fa-users"></i>
            <div>
              <strong>{users.length}</strong>
              <span>Utilisateurs inscrits</span>
            </div>
          </div>
          <div className="stat-card warning">
            <i className="fa-solid fa-shield-halved"></i>
            <div>
              <strong>{admins.length}</strong>
              <span>Administrateurs</span>
            </div>
          </div>
          <div className="stat-card info">
            <i className="fa-solid fa-folder-tree"></i>
            <div>
              <strong>{categories.length}</strong>
              <span>Catégories</span>
            </div>
          </div>
          <div className="stat-card secondary">
            <i className="fa-solid fa-bell"></i>
            <div>
              <strong>{nonLu}</strong>
              <span>Notifications non lues</span>
            </div>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            <i className="fa-solid fa-gauge-high"></i> Vue d'ensemble
          </button>
          <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
            <i className="fa-solid fa-users"></i> Utilisateurs ({nonAdmins.length})
          </button>
          <button className={`tab-btn ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>
            <i className="fa-solid fa-folder-tree"></i> Catégories
          </button>
          <button className={`tab-btn ${activeTab === "marques" ? "active" : ""}`} onClick={() => setActiveTab("marques")}>
            <i className="fa-solid fa-tag"></i> Marques
          </button>
          <button className={`tab-btn ${activeTab === "admins" ? "active" : ""}`} onClick={() => setActiveTab("admins")}>
            <i className="fa-solid fa-shield-halved"></i> Administrateurs ({admins.length})
          </button>
          <button className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>
            <i className="fa-solid fa-bell"></i> Problèmes techniques
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="admin-section">
            <h2>Vue d'ensemble</h2>
            <p className="empty-msg">
              Bienvenue dans l'espace d'administration technique. Utilisez les onglets
              ci-dessus pour gérer les utilisateurs, les catégories, les marques,
              les comptes administrateurs et le fonctionnement général du site.
            </p>
          </div>
        )}

        {activeTab === "users" && (
          <div className="admin-section">
            <h2>Liste des utilisateurs (acheteurs & vendeurs)</h2>
            {nonAdmins.length === 0 ? (
              <p className="empty-msg">Aucun utilisateur inscrit.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Email</th>
                      <th>Pseudo</th>
                      <th>Rôle</th>
                      <th>Bloqué</th>
                      <th>Inscrit le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonAdmins.map((u) => (
                      <tr key={u.id} className={u.blocked ? "row-blocked" : ""}>
                        <td>{u.id}</td>
                        <td>{u.email}</td>
                        <td>{u.pseudo || "-"}</td>
                        <td>
                          <span className={`badge ${u.role === "vendeur" ? "badge-vendeur" : "badge-acheteur"}`}>
                            {roleLabel(u.role)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.blocked ? "badge-danger" : "badge-success"}`}>
                            {u.blocked ? "Oui" : "Non"}
                          </span>
                        </td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                        <td>
                          <div className="action-btns">
                            <button
                              className={`btn-small ${u.blocked ? "btn-success" : "btn-danger"}`}
                              onClick={() => toggleBlockUser(u.id, u.blocked)}
                            >
                              <i className={`fa-solid ${u.blocked ? "fa-unlock" : "fa-lock"}`}></i>{" "}
                              {u.blocked ? "Débloquer" : "Bloquer"}
                            </button>
                            <button
                              className="btn-small btn-danger-outline"
                              onClick={() => deleteUser(u.id, u.email)}
                            >
                              <i className="fa-solid fa-trash"></i> Supprimer
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

        {activeTab === "categories" && (
          <div className="admin-section">
            <h2>Gestion des catégories</h2>
            <form className="admin-inline-form" onSubmit={createCategory}>
              <input
                type="text"
                placeholder="Nom de la nouvelle catégorie"
                value={catForm.name}
                onChange={(e) => setCatForm({ name: e.target.value })}
              />
              <button className="btn-small btn-success" type="submit" disabled={saving}>
                <i className="fa-solid fa-plus"></i> Ajouter
              </button>
            </form>
            {categories.length === 0 ? (
              <p className="empty-msg">Aucune catégorie.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.name}</td>
                        <td>
                          <button className="btn-small btn-danger-outline" onClick={() => deleteCategory(c)}>
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

        {activeTab === "marques" && (
          <div className="admin-section">
            <h2>Gestion des marques</h2>
            <form className="admin-inline-form" onSubmit={createMarque}>
              <input
                type="text"
                placeholder="Nom de la marque"
                value={marqueForm.nom}
                onChange={(e) => setMarqueForm({ ...marqueForm, nom: e.target.value })}
              />
              <input
                type="text"
                placeholder="Logo (URL) - optionnel"
                value={marqueForm.logo}
                onChange={(e) => setMarqueForm({ ...marqueForm, logo: e.target.value })}
              />
              <button className="btn-small btn-success" type="submit" disabled={saving}>
                <i className="fa-solid fa-plus"></i> Ajouter
              </button>
            </form>
            {marques.length === 0 ? (
              <p className="empty-msg">Aucune marque.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marques.map((m) => (
                      <tr key={m.id}>
                        <td>{m.id}</td>
                        <td>{m.nom}</td>
                        <td>
                          <button className="btn-small btn-danger-outline" onClick={() => deleteMarque(m)}>
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

        {activeTab === "admins" && (
          <div className="admin-section">
            <h2>Créer un compte administrateur</h2>
            <form className="admin-form-grid" onSubmit={createAdmin}>
              <div className="form-group">
                <label>Pseudo</label>
                <input
                  type="text"
                  placeholder="Pseudo de l'administrateur"
                  value={adminForm.pseudo}
                  onChange={(e) => setAdminForm({ ...adminForm, pseudo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="admin@entreprise.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Type d'administrateur</label>
                <select
                  value={adminForm.adminRole}
                  onChange={(e) => setAdminForm({ ...adminForm, adminRole: e.target.value })}
                >
                  <option value="admin_commercial">Administrateur commercial</option>
                  <option value="admin_technique">Administrateur technique</option>
                </select>
              </div>
              <div className="form-group form-group-full">
                <button className="btn-small btn-success" type="submit" disabled={saving}>
                  <i className="fa-solid fa-user-shield"></i> Créer le compte administrateur
                </button>
              </div>
            </form>

            <h2 style={{ marginTop: "2rem" }}>Comptes administrateurs existants</h2>
            {admins.length === 0 ? (
              <p className="empty-msg">Aucun administrateur.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Email</th>
                      <th>Pseudo</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.email}</td>
                        <td>{u.pseudo || "-"}</td>
                        <td>
                          <span className={`badge ${u.role === "admin_technique" ? "badge-tech" : "badge-com"}`}>
                            {roleLabel(u.role)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="admin-section">
            <h2>Suivi des connexions & inscriptions (problèmes techniques)</h2>
            {notifications.length === 0 ? (
              <p className="empty-msg">Aucune notification.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Message</th>
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((n) => (
                      <tr key={n.id}>
                        <td>{n.id}</td>
                        <td>{n.message}</td>
                        <td>{n.userPseudo || n.userEmail || "-"}</td>
                        <td>{n.role || "-"}</td>
                        <td>{n.date ? new Date(n.date).toLocaleString() : "-"}</td>
                        <td>
                          {n.lu ? (
                            <span className="badge badge-success">Lue</span>
                          ) : (
                            <button className="btn-small btn-warning" onClick={() => markNotifRead(n.id)}>
                              Marquer lue
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
