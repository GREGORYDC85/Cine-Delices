import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css"; // si tu veux un style dédié

function Dashboard() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🔑 Token envoyé :", token);

    if (!token) {
      alert("Accès refusé : aucun token trouvé.");
      navigate("/login");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("✅ Réponse reçue :", response.data);
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("❌ Erreur lors de l'accès :", error);
        alert("Accès refusé !");
        navigate("/login");
      });
  }, []);

  return (
    <div className="dashboard-container">
      <h1>🎛️ Tableau de bord Admin</h1>
      <p>{message}</p>

      <div className="admin-links">
        <h2>Gérer le contenu du site :</h2>
        <ul>
          <li><Link to="/admin/recettes">📖 Recettes</Link></li>
          <li><Link to="/admin/utilisateurs">👥 Utilisateurs</Link></li>
          <li><Link to="/admin/commentaires">💬 Commentaires</Link></li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
