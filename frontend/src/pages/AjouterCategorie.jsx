import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import useTitle from "../hooks/useTitle";
import { useAuth } from "../context/AuthContext";

export default function AjouterCategorie() {
    useTitle("Ajouter catégorie");
    const navigate = useNavigate();
    const { user, isTechnicalAdmin } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (!isTechnicalAdmin) {
            navigate("/admin/login", { replace: true });
        }
    }, [user, isTechnicalAdmin, navigate]);

    const [form, setForm] = useState({ name: "", image: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) {
            alert("Veuillez entrer un nom de catégorie");
            return;
        }

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name, image: form.image || undefined }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Erreur HTTP: ${res.status}`);
            }

            alert("Catégorie ajoutée avec succès");
            const params = new URLSearchParams(window.location.search);
            const entreprise = params.get("entreprise") || "Toyota";
            navigate(`/categories/${encodeURIComponent(entreprise)}`);
        } catch (err) {
            console.error("Erreur ajout catégorie:", err);
            alert("Impossible d'ajouter la catégorie.");
        }
    };

    return (
        <>
            <Nav />
            <div className="container">
                <h2 className="title">
                    <i className="fa-solid fa-folder-plus"></i> Ajouter une catégorie
                </h2>
                <div className="form-box" style={{ maxWidth: 440, margin: "0 auto" }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nom de la catégorie</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Ex: Roue"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Image (URL)</label>
                            <input
                                type="text"
                                name="image"
                                placeholder="https://..."
                                value={form.image}
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit" className="card-btn" style={{ width: "100%", marginTop: "1rem" }}>
                            <i className="fa-solid fa-check"></i> Enregistrer
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}
