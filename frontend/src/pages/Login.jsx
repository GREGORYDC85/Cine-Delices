import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 📌 Récupérer l'URL du backend
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!API_URL) {
      console.error("❌ Erreur: VITE_API_URL non défini !");
      toast.error("⚠️ Erreur serveur : API_URL non configuré.");
    }

    // 📌 Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem("token");
    if (token) {
      console.log("🔄 Redirection automatique : utilisateur déjà connecté.");
      navigate("/dashboard");
    }
  }, [API_URL, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!API_URL) {
      toast.error("⚠️ Serveur non configuré. Vérifie ton .env.");
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Tentative de connexion avec :", email);

      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });

      console.log("✅ Réponse reçue du backend :", data);

      if (!data.token) {
        throw new Error("❌ Aucun token reçu du serveur.");
      }

      // ✅ Stockage sécurisé du token et des infos utilisateur
      localStorage.setItem("token", data.token);
      const user = jwtDecode(data.token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("✅ Token stocké avec succès :", localStorage.getItem("token"));
      console.log("👤 Utilisateur stocké :", localStorage.getItem("user"));

      // ✅ Affichage de succès et redirection selon le rôle
      toast.success("🎉 Connexion réussie !");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        if (user.role === "admin") {
          console.log("🚀 Redirection vers le Dashboard Admin");
          navigate("/admin/dashboard");
        } else {
          console.log("🚀 Redirection vers la page d'accueil");
          navigate("/");
        }
      }, 1000);

    } catch (err) {
      console.error("❌ Erreur de connexion :", err);

      if (!err.response) {
        toast.error("❌ Erreur réseau - Serveur inaccessible.");
      } else {
        const errorMessage = err.response?.data?.error || "❌ Erreur serveur.";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Connexion 🔑</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

export default Login;
