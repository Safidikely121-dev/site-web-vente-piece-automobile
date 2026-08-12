import { useEffect, useRef, useState } from "react";
import "./ChatWidget.css";

/**
 * Assistant virtuel flottant (feature IA n°1 : chatbot intelligent).
 * Visible sur toutes les pages, disponible pour les visiteurs comme
 * pour les utilisateurs connectés. Communique avec /api/ai/chat.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis l'assistant AutoParts. Posez-moi une question sur nos pièces, vos commandes, la livraison ou le paiement.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history = nextMessages
        .slice(-8)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Désolé, je n'ai pas de réponse pour le moment." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Une erreur est survenue. Vous pouvez réessayer, ou utiliser le formulaire \"Demande de produit\" si besoin.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget-root">
      {open && (
        <div className="chat-widget-panel">
          <div className="chat-widget-header">
            <div>
              <strong>Assistant AutoParts</strong>
              <span className="chat-widget-status">
                <i className="fa-solid fa-circle" /> En ligne
              </span>
            </div>
            <button
              className="chat-widget-close"
              onClick={() => setOpen(false)}
              aria-label="Fermer l'assistant"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="chat-widget-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-bubble ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bubble-assistant chat-bubble-typing">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            )}
          </div>

          <form className="chat-widget-input-row" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre question..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Envoyer">
              <i className="fa-solid fa-paper-plane" />
            </button>
          </form>
        </div>
      )}

      <button
        className="chat-widget-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-comment-dots"}`} />
      </button>
    </div>
  );
}
