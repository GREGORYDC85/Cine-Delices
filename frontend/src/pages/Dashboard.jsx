console.log("📌 Le composant Dashboard est bien rendu !");

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null); // ✅ Stocke le token localement
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    console.log("🔑 Token stocké (avant requête) :", storedToken);

    if (!storedToken) {
      console.warn("❌ Aucun token trouvé. Redirection vers la connexion.");
      alert("Accès refusé : aucun token.");
      navigate("/login");
      return;
    }

    setToken(storedToken); // ✅ Met à jour l’état du token

    console.log("📡 Envoi de la requête à /admin/dashboard...");

    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${storedToken}` }, // ✅ Envoi du token dans le header
      })
      .then((response) => {
        console.log("✅ Réponse reçue du backend :", response.data);
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("❌ Erreur Axios :", error);

        if (error.response) {
          if (error.response.status === 401) {
            console.warn("⚠️ Accès refusé : Token invalide ou expiré.");
            alert("Accès refusé. Veuillez vous reconnecter.");
            localStorage.removeItem("token"); // ✅ Supprime le token corrompu
            navigate("/login");
          } else if (error.response.status === 403) {
            console.warn("⚠️ Accès refusé : Rôle administrateur requis.");
            alert("Accès interdit. Vous devez être administrateur.");
            navigate("/");
          } else {
            console.warn("⚠️ Erreur serveur :", error.response.data.error);
            alert(`Erreur : ${error.response.data.error}`);
          }
        } else {
          console.warn("⚠️ Erreur réseau : Le serveur est peut-être hors ligne.");
          alert("Erreur réseau. Vérifiez votre connexion.");
        }
      });
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard Admin</h1>
      {token ? <p>{message}</p> : <p>Vérification des autorisations...</p>}
    </div>
  );
}

export default Dashboard;
