import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // 🔄 Indicateur de chargement
  const navigate = useNavigate();

  // 📌 Récupérer l'URL du backend depuis le fichier .env
  const API_URL = import.meta.env.VITE_API_URL;

  if (!API_URL) {
    console.error("❌ VITE_API_URL non défini ! Vérifie ton .env.");
    toast.error("⚠️ Erreur serveur : API_URL non configuré.");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!API_URL) {
      toast.error("⚠️ Serveur non configuré. Vérifie ton .env.");
      return;
    }

    setLoading(true); // 🔄 Empêche les clics multiples

    try {
      console.log("🔄 Tentative de connexion avec :", email);

      // ✅ Envoi des données au backend
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });

      console.log("✅ Réponse reçue du backend :", data);

      // 🔥 Vérification du token reçu
      if (!data.token) {
        throw new Error("Token non reçu du serveur.");
      }

      // ✅ Stockage du token et des infos utilisateur
      localStorage.setItem("token", data.token);
      const user = jwtDecode(data.token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Affichage de succès et redirection
      toast.success("🎉 Connexion réussie !");
      setEmail("");  // Nettoyage du champ email
      setPassword("");  // Nettoyage du champ password

      // 🔄 Petit délai pour fluidifier l'expérience utilisateur
      setTimeout(() => {
        navigate("/"); // 🔄 Redirection vers la page d'accueil
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
      setLoading(false); // ✅ Réactive le bouton après la requête
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
