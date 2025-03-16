import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <div>
      <h1>Dashboard Admin</h1>
      <p>{message}</p>
    </div>
  );
}

export default Dashboard;
