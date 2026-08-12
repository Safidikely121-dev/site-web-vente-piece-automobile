/**
 * Page des Entreprises - Sélection des marques automobiles

 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import "../styles/Global.css";
import "../styles/Entreprise.css";
import "../styles/Boutton.css";


// ===== LOGOS EN JPG =====
import toyotaLogo from "../assets/toyota.jpg";
import boschLogo from "../assets/bosch.jpg";
import fordLogo from "../assets/ford.jpg";
import nissanLogo from "../assets/nissan.jpg";
import hondaLogo from "../assets/honda.jpg";
import bmwLogo from "../assets/bmw.jpg";
import audiLogo from "../assets/auddi.jpg";
import kiaLogo from "../assets/kia.jpg";
import mazdaLogo from "../assets/mazda.jpg";
import gmsLogo from "../assets/motors.jpg";
import benzLogo from "../assets/benz.jpg";
import hyundaiLogo from "../assets/hyundai.jpg";
import bydLogo from "../assets/byd.jpg";
import geelyLogo from "../assets/geely.jpg";

// ===== LOGOS EN SVG (créés localement) =====
import renaultLogo from "../assets/renault.svg";
import peugeotLogo from "../assets/peugeot.svg";
import citroenLogo from "../assets/citroen.svg";
import daciaLogo from "../assets/dacia.svg";
import valeLoGo from "../assets/valeo.svg";
import totalLogo from "../assets/totalenergies.svg";
import useTitle from "../hooks/useTitle";

// ===== BASE DE DONNEES DES 20 ENTREPRISES =====
const entreprises = [
  { nom: "Toyota", logo: toyotaLogo },
  { nom: "Bosch", logo: boschLogo },
  { nom: "Ford", logo: fordLogo },
  { nom: "Nissan", logo: nissanLogo },
  { nom: "Honda", logo: hondaLogo },
  { nom: "BMW", logo: bmwLogo },
  { nom: "Audi", logo: audiLogo },
  { nom: "Kia", logo: kiaLogo },
  { nom: "Mazda", logo: mazdaLogo },
  { nom: "General Motors", logo: gmsLogo },
  { nom: "Mercedes-Benz", logo: benzLogo },
  { nom: "Hyundai", logo: hyundaiLogo },
  { nom: "BYD", logo: bydLogo },
  { nom: "Geely", logo: geelyLogo },
  { nom: "Renault", logo: renaultLogo },
  { nom: "Peugeot", logo: peugeotLogo },
  { nom: "Citroën", logo: citroenLogo },
  { nom: "Dacia", logo: daciaLogo },
  { nom: "Valeo", logo: valeLoGo },
  { nom: "TotalEnergies", logo: totalLogo }
];

/**
 * Fonction utilitaire: Génère les initiales pour le badge
 */
function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Composant principal: Affiche la grille des entreprises
 */
export default function Entreprises() {
  useTitle("Nos Marques");
  const navigate = useNavigate();
  const { isAcheteur, isTechnicalAdmin } = useAuth();
  const [search, setSearch] = useState("");

  // Marques ajoutées dynamiquement (backend), en plus des 20 marques
  // déjà affichées ci-dessus. On ne modifie jamais le tableau statique
  // existant : on ajoute seulement les nouvelles marques à la suite.
  const [extraEntreprises, setExtraEntreprises] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadMarques = async () => {
      try {
        const res = await fetch("/api/marques");
        if (!res.ok) return;

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        // On ignore les marques dont le nom existe déjà dans la liste statique,
        // pour ne jamais afficher de doublon ni changer le comportement actuel.
        const existingNames = new Set(
          entreprises.map((e) => e.nom.trim().toLowerCase())
        );

        const nouvelles = list
          .filter((m) => m?.nom && !existingNames.has(String(m.nom).trim().toLowerCase()))
          .map((m) => ({ nom: m.nom, logo: m.logo || null }));

        if (!cancelled) setExtraEntreprises(nouvelles);
      } catch {
        // En cas d'erreur réseau, on garde simplement la liste statique existante.
      }
    };

    loadMarques();
    return () => {
      cancelled = true;
    };
  }, []);

  const toutesLesEntreprises = useMemo(
    () => [...entreprises, ...extraEntreprises],
    [extraEntreprises]
  );

  const filteredEntreprises = toutesLesEntreprises.filter((e) =>
    e.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Nav />
      <div className="container">
        <h2 className="title">Offres disponibles</h2>
        {isTechnicalAdmin && (
          <button
            className="add-offer-btn"
            onClick={() => navigate("/ajouter-marques")}
          >
            + Ajouter marques
          </button>
        )}

        {isAcheteur && (
          <>
            <div className="search-container" style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Rechercher une marque..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="clear-btn" onClick={() => setSearch("")} style={{ marginLeft: 8 }}>
                  ✖
                </button>
              )}
            </div>
            <div className="center" style={{ marginBottom: "1.5rem" }}>
              <button
                className="add-offer-btn"
                onClick={() => navigate("/demandeproduit")}
              >
                + Ajouter une demande
              </button>
            </div>
          </>
        )}

        <div className="grid">
          {filteredEntreprises.map((e, i) => (
            <button
              key={i}
              className="card-btn entreprise-card"
              onClick={() => navigate(`/categories/${e.nom}`)}
              title={`Voir les categories de ${e.nom}`}
            >
              {e.logo ? (
                <img src={e.logo} alt={`Logo ${e.nom}`} className="logo" />
              ) : (
                <div className="company-badge">{getInitials(e.nom)}</div>
              )}
              <span className="company-name">{e.nom}</span>
            </button>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
