import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Garde de route pour les espaces d'administration.
 *
 * requiredRole : "admin_technique" | "admin_commercial" | "any"
 *  - "any" : un administrateur (technique ou commercial) peut accéder.
 */
export default function RequireAdminRole({ requiredRole = "any", children }) {
  const { user, loading, isAdmin, isTechnicalAdmin, isCommercialAdmin } =
    useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/admin/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate("/", { replace: true });
      return;
    }
    if (requiredRole === "admin_technique" && !isTechnicalAdmin) {
      navigate(isCommercialAdmin ? "/admin/commercial" : "/", {
        replace: true,
      });
      return;
    }
    if (requiredRole === "admin_commercial" && !isCommercialAdmin) {
      navigate(isTechnicalAdmin ? "/admin/technique" : "/", { replace: true });
    }
  }, [loading, user, isAdmin, isTechnicalAdmin, isCommercialAdmin, requiredRole, navigate]);

  if (loading) {
    return (
      <div className="container center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  if (requiredRole === "admin_technique" && !isTechnicalAdmin) return null;
  if (requiredRole === "admin_commercial" && !isCommercialAdmin) return null;

  return <>{children}</>;
}

/**
 * Redirige /admin vers le bon tableau de bord selon le type d'administrateur,
 * ou vers la page de connexion administrateur si non connecté.
 */
export function AdminRedirect() {
  const { user, loading, isAdmin, isTechnicalAdmin, isCommercialAdmin } =
    useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) {
      navigate("/admin/login", { replace: true });
      return;
    }
    if (isTechnicalAdmin) navigate("/admin/technique", { replace: true });
    else if (isCommercialAdmin) navigate("/admin/commercial", { replace: true });
  }, [loading, user, isAdmin, isTechnicalAdmin, isCommercialAdmin, navigate]);

  if (loading) {
    return (
      <div className="container center">
        <p>Chargement...</p>
      </div>
    );
  }

  return null;
}
