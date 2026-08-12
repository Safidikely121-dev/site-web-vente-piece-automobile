import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import useTitle from "../hooks/useTitle";
import { useAuth } from "../context/AuthContext";

export default function AjouterMarques() {
    useTitle("Ajouter marque");
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

    const [form, setForm] = useState({ nom: "", logo: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nom) {
            alert("Veuillez entrer un nom de marque");
            return;
        }

        try {
            const res = await fetch("/api/marques", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom: form.nom, logo: form.logo || undefined }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Erreur HTTP: ${res.status}`);
            }

            alert("Marque ajoutée avec succès");
            navigate("/entreprises");
        } catch (err) {
            console.error("Erreur ajout marque:", err);
            alert("Impossible d'ajouter la marque.");
        }
    };

    return (
        <>
            <Nav />
            <div className="container">
                <h2 className="title">
                    <i className="fa-solid fa-plus"></i> Ajouter une marque
                </h2>
                <div className="form-box" style={{ maxWidth: 440, margin: "0 auto" }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nom de la marque</label>
                            <input
                                type="text"
                                name="nom"
                                placeholder="Ex: Volkswagen"
                                value={form.nom}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Logo (URL)</label>
                            <input
                                type="text"
                                name="logo"
                                placeholder="https://..."
                                value={form.logo}
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
