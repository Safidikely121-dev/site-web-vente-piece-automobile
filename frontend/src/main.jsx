import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/Variable.css";
import "./index.css";

// ══════════════════════════════════════════════════════════
// Global handler: attrape les erreurs de promesses non gérées
// (ex: listener indiquant une réponse asynchrone d'une extension navigateur).
// ══════════════════════════════════════════════════════════
window.addEventListener("unhandledrejection", (event) => {
  const msg = String(event?.reason?.message ?? event?.reason ?? "");
  if (
    msg.includes("listener indicated an asynchronous response") ||
    msg.includes("channel closed before a response was received")
  ) {
    // Ce type d'erreur est généralement causée par une extension navigateur
    // (ex: bloqueur de pub, gestionnaire de mots de passe, etc.).
    // On empêche l'affichage dans la console du navigateur.
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
