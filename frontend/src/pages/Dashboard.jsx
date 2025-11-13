import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // ✅ Remplace les alert() par des toasts
import "./Dashboard.css";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true); // ✅ État de chargement
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Accès refusé : vous devez être connecté.");
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // ✅ Utilisation du proxy /api
        const response = await axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage(response.data.message || "Bienvenue sur votre tableau de bord admin !");
      } catch (error) {
        console.error("❌ Erreur lors de l'accès :", error);
        toast.error("Accès refusé : session expirée ou permissions insuffisantes.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h1>🎛️ Tableau de bord Admin</h1>

      {loading ? (
        <p className="loading">Chargement des données...</p>
      ) : (
        <>
          <p className="dashboard-message">{message}</p>

          <div className="admin-links">
            <h2>Gérer le contenu du site :</h2>
            <ul className="admin-links-list">
              <li>
                <Link to="/admin/recettes" className="admin-link-item">
                  <span className="link-icon">📖</span> Recettes
                </Link>
              </li>
              <li>
                <Link to="/admin/utilisateurs" className="admin-link-item">
                  <span className="link-icon">👥</span> Utilisateurs
                </Link>
              </li>
              <li>
                <Link to="/admin/commentaires" className="admin-link-item">
                  <span className="link-icon">💬</span> Commentaires
                </Link>
              </li>
              <li>
                <Link to="/admin/works" className="admin-link-item">
                  <span className="link-icon">🎬</span> Œuvres (films & séries)
                </Link>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
