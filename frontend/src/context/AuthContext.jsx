import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const userRole = user?.role;
  const isLoggedIn = !!user;
  const isVendeur = userRole === "vendeur";
  const isAcheteur = userRole === "acheteur";
  const isAdmin =
    userRole === "admin_technique" || userRole === "admin_commercial";
  const isTechnicalAdmin = userRole === "admin_technique";
  const isCommercialAdmin = userRole === "admin_commercial";

  const API_URL = "/api/auth";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const sub = decoded?.sub;
        const role = decoded?.role;

        if (sub == null) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser({
            id: sub,
            email: decoded?.email,
            pseudo: decoded?.pseudo,
            role,
          });
        }
      } catch (err) {
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const getUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const res = await fetch(`${API_URL}/user`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        setUser(null);
        return null;
      }

      return await res.json();
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);
      return null;
    }
  };

  const applyToken = (data) => {
    if (!data?.token) {
      return { success: false, message: "Réponse invalide du serveur (token manquant)" };
    }

    localStorage.setItem("token", data.token);

    let decoded;
    try {
      decoded = jwtDecode(data.token);
    } catch {
      localStorage.removeItem("token");
      return { success: false, message: "Token JWT invalide" };
    }

    const sub = decoded?.sub;
    if (sub == null) {
      localStorage.removeItem("token");
      return { success: false, message: "Token JWT incomplet (sub manquant)" };
    }

    setUser({
      id: sub,
      email: decoded?.email,
      pseudo: decoded?.pseudo,
      role: decoded?.role,
    });

    return { success: true };
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // backend peut renvoyer du HTML/texte en cas de 500 -> on gère sans planter
      const data = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Erreur de connexion",
        };
      }

      return applyToken(data);
    } catch (err) {
      console.error("LOGIN ERROR :", err);
      return {
        success: false,
        message: "Erreur réseau",
      };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Erreur de connexion",
        };
      }

      return applyToken(data);
    } catch (err) {
      console.error("ADMIN LOGIN ERROR :", err);
      return {
        success: false,
        message: "Erreur réseau",
      };
    }
  };

  const register = async ({ email, password, pseudo, role, fullName, telephone, adresse }) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          pseudo,
          role,
          fullName,
          telephone,
          adresse,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Erreur d'inscription",
        };
      }

      return {
        success: true,
        message: data.message || "Inscription réussie",
      };
    } catch {
      return {
        success: false,
        message: "Erreur réseau",
      };
    }
  };

  const registerAdmin = async ({ email, password, pseudo, adminRole }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email,
          password,
          pseudo,
          adminRole,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Erreur lors de la création du compte",
        };
      }

      return {
        success: true,
        message: data.message || "Compte administrateur créé",
      };
    } catch {
      return {
        success: false,
        message: "Erreur réseau",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role: userRole,
        isLoggedIn,
        isVendeur,
        isAcheteur,
        isAdmin,
        isTechnicalAdmin,
        isCommercialAdmin,
        setUser,
        login,
        adminLogin,
        register,
        registerAdmin,
        logout,
        getUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
