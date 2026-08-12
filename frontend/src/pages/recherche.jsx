import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Entreprise.css";
import "../styles/Boutton.css";
import "../styles/Recherche.css";

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
import renaultLogo from "../assets/renault.svg";
import peugeotLogo from "../assets/peugeot.svg";
import citroenLogo from "../assets/citroen.svg";
import daciaLogo from "../assets/dacia.svg";
import valeLoGo from "../assets/valeo.svg";
import totalLogo from "../assets/totalenergies.svg";
import useTitle from "../hooks/useTitle";

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
  { nom: "TotalEnergies", logo: totalLogo },
];

function getInitials(name) {
  return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
}

export default function Recherche() {
  useTitle("Recherche");
  const { isAcheteur } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredEntreprises = entreprises.filter((e) =>
    e.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Nav />
      <div className="container">
        <h2 className="title">
          <i className="fa-solid fa-magnifying-glass"></i> Recherche
        </h2>

        {isAcheteur && (
          <div className="center" style={{ marginBottom: "1rem" }}>
            <button className="add-offer-btn" onClick={() => navigate("/demandeproduit")}>
              + Ajouter une demande
            </button>
          </div>
        )}

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher une marque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid">
          {filteredEntreprises.length > 0 ? (
            filteredEntreprises.map((e, i) => (
              <button
                key={i}
                className="card-btn entreprise-card"
                onClick={() => navigate(`/Categorierech/${encodeURIComponent(e.nom)}`)}
                title={`Voir les catégories de ${e.nom}`}
              >
                {e.logo ? (
                  <img src={e.logo} alt={`Logo ${e.nom}`} className="logo" />
                ) : (
                  <div className="company-badge">{getInitials(e.nom)}</div>
                )}
                <span className="company-name">{e.nom}</span>
              </button>
            ))
          ) : (
            <p className="no-result" style={{ gridColumn: "1 / -1" }}>
              Aucune marque trouvée.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
