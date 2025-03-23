import { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // 🔍 Récupérer les infos de l'utilisateur
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const response = await axios.get("http://localhost:5002/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);  // ✅ Met à jour l'état avec les données de l'API
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du profil :", error);
      }
    };

    fetchUserData();
  }, []);

  // 🔥 Fonction pour sauvegarder les modifications
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("✅ Données envoyées :", user);  // ✅ Vérifier les données envoyées

      const response = await axios.put("http://localhost:5002/api/profile/update", user, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Réponse API :", response.data);  // ✅ Vérifier la réponse de l'API

      setUser(response.data);  // ✅ Met à jour l'état avec la réponse API
      setEditing(false);  // ✅ Ferme le mode édition
      alert("✅ Profil mis à jour !");
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du profil :", error);
    }
  };

  return (
    <div className="profile-container">
      <h1>👤 Mon Profil</h1>

      {editing ? (
        <div className="profile-form">
          <label>Nom :</label>
          <input
            type="text"
            value={user.lastName}
            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
          />

          <label>Prénom :</label>
          <input
            type="text"
            value={user.firstName}
            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
          />

          <label>Sexe :</label>
          <select
            value={user.gender}
            onChange={(e) => setUser({ ...user, gender: e.target.value })}
          >
            <option value="">Choisir...</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
            <option value="Autre">Autre</option>
          </select>

          <label>Âge :</label>
          <input
            type="number"
            value={user.age}
            onChange={(e) => setUser({ ...user, age: e.target.value })}
          />

          <button onClick={handleSave}>💾 Sauvegarder</button>
        </div>
      ) : (
        <div className="profile-info">
          <p><strong>Nom :</strong> {user.lastName}</p>
          <p><strong>Prénom :</strong> {user.firstName}</p>
          <p><strong>Sexe :</strong> {user.gender}</p>
          <p><strong>Âge :</strong> {user.age}</p>
          <button onClick={() => setEditing(true)}>✏️ Modifier</button>
        </div>
      )}
    </div>
  );
}

export default Profile;
