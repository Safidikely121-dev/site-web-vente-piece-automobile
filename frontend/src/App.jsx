import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import ChatWidget from "./components/ChatWidget";

// Pages - Principales
import Homes from "./pages/Homes";
import Entreprises from "./pages/Entreprises";
import Recherche from "./pages/recherche";
import Categories from "./pages/Categories";
import Commande from "./pages/Commande";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProduitsDynamique from "./pages/ProduitsDynamique";


// Pages - Catégories de produits
import Moteur from "./pages/Moteur";
import Roue from "./pages/Roue";
import Direction from "./pages/Direction";
import Transmission from "./pages/Transmission";
import Freinage from "./pages/Freinage";
import Eclairage from "./pages/Eclairage";
import Refroidissement from "./pages/Refroidissement";
import Admission from "./pages/Admission";
import Interieur from "./pages/Interieur";
import Panier from "./pages/Panier";
import Checkout from "./pages/Checkout";
import AjouterCategorie from "./pages/AjouterCategorie";
import AjouterMarques from "./pages/AjouterMarques";
import AjouterCommande from "./pages/AjouterCommande";
import Demandeproduit from "./pages/Demandeproduit";



import About from "./pages/About";
import AdminLogin from "./pages/AdminLogin";
import AdminTechnique from "./pages/AdminTechnique";
import AdminCommercial from "./pages/AdminCommercial";
import RequireAdminRole, { AdminRedirect } from "./components/RequireAdminRole";
import Services from "./pages/Services";
import Support from "./pages/Support";




export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <div className="app">
              <Routes>
                {/* Route d'accueil */}
                <Route path="/" element={<Homes />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/support" element={<Support />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/panier" element={<Panier />} />
                <Route path="/checkout" element={<Checkout />} />

                {/* Route pour sélectionner une entreprise */}
                <Route path="/entreprises" element={<Entreprises />} />

                {/* Route pour sélectionner une entreprise */}
                <Route path="/recherche" element={<Recherche />} />

                {/* Route pour ajouter categorie */}
                <Route path="/ajouter-categorie" element={<AjouterCategorie />} />

                {/* Route pour ajouter marque (bouton "+ Ajouter marques" sur /entreprises) */}
                <Route path="/ajouter-marques" element={<AjouterMarques />} />

                {/* Route pour ajouter commande */}
                <Route path="/ajouter-commande" element={<AjouterCommande />} />

                 {/* Route pour ajouter demande produit */}
                <Route path="/demandeproduit" element={<Demandeproduit />} />



{/* Route pour afficher les catégories d'une entreprise (vendeur/offres) */}
                <Route path="/categories/:entreprise" element={<Categories />} />

                {/* Route pour afficher les catégories d'une entreprise (acheteur/recherche) */}
                <Route path="/Categorierech/:entreprise" element={<Categories />} />

                {/* Route Admin */}
                <Route path="/admin" element={<AdminRedirect />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/technique"
                  element={
                    <RequireAdminRole requiredRole="admin_technique">
                      <AdminTechnique />
                    </RequireAdminRole>
                  }
                />
                <Route
                  path="/admin/commercial"
                  element={
                    <RequireAdminRole requiredRole="admin_commercial">
                      <AdminCommercial />
                    </RequireAdminRole>
                  }
                />

                {/* Route de recherche / ancienne page commande */}
                <Route path="/commande" element={<Commande />} />

                {/* Routes pour chaque catégorie de produits */}
                <Route path="/produits/Pièce moteur/:subtype?" element={<Moteur />} />
                <Route path="/produits/Roue/:subtype?" element={<Roue />} />
                <Route path="/produits/Système de transmission/:subtype?" element={<Transmission />} />
                <Route path="/produits/Suspension et direction/:subtype?" element={<Direction />} />
                <Route path="/produits/Système de freinage/:subtype?" element={<Freinage />} />
                <Route path="/produits/Éclairage et signalisation/:subtype?" element={<Eclairage />} />
                <Route path="/produits/Systèmes de refroidissement/:subtype?" element={<Refroidissement />} />
                <Route path="/produits/Admission et échappement/:subtype?" element={<Admission />} />
                <Route path="/produits/Intérieur et carrosserie/:subtype?" element={<Interieur />} />

                {/* Route générique pour catégories ajoutées dynamiquement */}
                <Route path="/produits/:categorierech" element={<ProduitsDynamique />} />
              </Routes>

              <ChatWidget />
            </div>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
