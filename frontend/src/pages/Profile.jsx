import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState({
    pseudo: "",
    description: "",
    firstname: "",
    name: "",
    gender: "",
    birthdate: "",
    email: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [editing, setEditing] = useState(false);
  const [likedRecipes, setLikedRecipes] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchUserData = async () => {
      try {
        console.log("Token utilisé pour récupérer les données :", token); // Vérifie que le token est bien récupéré
        const res = await axios.get("http://localhost:5002/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Données utilisateur récupérées :", res.data); // Affiche les données utilisateur
        setUser(res.data);
      } catch (error) {
        console.error("❌ Erreur récupération profil :", error);
      }
    };

    const fetchLikedRecipes = async () => {
      try {
        console.log("Récupération des recettes likées avec le token :", token); // Vérifie que le token est bien récupéré
        const res = await axios.get("http://localhost:5002/api/likes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Recettes likées récupérées :", res.data); // Affiche les recettes likées récupérées
        setLikedRecipes(res.data);
      } catch (error) {
        console.error("❌ Erreur récupération recettes likées :", error);
      }
    };

    fetchUserData();
    fetchLikedRecipes();
  }, [token]);

  const handleSave = async () => {
    try {
      const formattedUser = {
        ...user,
        birthdate: user.birthdate ? user.birthdate.split("T")[0] : null,
      };

      await axios.put("http://localhost:5002/api/profile/update", formattedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (newPassword) {
        await axios.put(
          "http://localhost:5002/api/profile/password",
          { newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("🔒 Mot de passe mis à jour !");
        setNewPassword("");
      }

      alert("✅ Profil mis à jour !");
      setEditing(false);
    } catch (error) {
      console.error("❌ Erreur mise à jour profil :", error);
      alert("⚠️ Une erreur s’est produite.");
    }
  };

  const handleUnlike = async (recipeId) => {
    try {
      console.log("Suppression du like pour la recette ID :", recipeId); // Affiche l'ID de la recette à supprimer des favoris
      await axios.delete("http://localhost:5002/api/likes", {
        data: { recipeId },
        headers: { Authorization: `Bearer ${token}` },
      });

      setLikedRecipes((prev) => prev.filter((r) => r.code_recipe !== recipeId));
    } catch (error) {
      console.error("❌ Erreur suppression like :", error);
    }
  };

  return (
    <div className="profile-container">
      <h1>👤 Mon Profil</h1>

      {editing ? (
        <div className="profile-form">
          <label>Pseudo :</label>
          <input
            type="text"
            value={user.pseudo}
            onChange={(e) => setUser({ ...user, pseudo: e.target.value })}
          />

          <label>Description :</label>
          <textarea
            value={user.description}
            onChange={(e) => setUser({ ...user, description: e.target.value })}
          />

          <label>Prénom :</label>
          <input
            type="text"
            value={user.firstname}
            onChange={(e) => setUser({ ...user, firstname: e.target.value })}
          />

          <label>Nom :</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
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
            <option value="Non spécifié">Non spécifié</option>
          </select>

          <label>Date de naissance :</label>
          <input
            type="date"
            value={user.birthdate ? user.birthdate.slice(0, 10) : ""}
            onChange={(e) => setUser({ ...user, birthdate: e.target.value })}
          />

          <label>Email :</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />

          <label>Nouveau mot de passe :</label>
          <input
            type="password"
            placeholder="Laisser vide si inchangé"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button onClick={handleSave}>💾 Sauvegarder</button>
        </div>
      ) : (
        <div className="profile-info">
          <p><strong>Pseudo :</strong> {user.pseudo}</p>
          <p><strong>Description :</strong> {user.description}</p>
          <p><strong>Prénom :</strong> {user.firstname}</p>
          <p><strong>Nom :</strong> {user.name}</p>
          <p><strong>Sexe :</strong> {user.gender}</p>
          <p><strong>Date de naissance :</strong> {user.birthdate?.split("T")[0]}</p>
          <p><strong>Email :</strong> {user.email}</p>
          <button onClick={() => setEditing(true)}>✏️ Modifier</button>
        </div>
      )}

      {likedRecipes.length > 0 && (
        <div className="liked-recipes">
          <h3>💖 Recettes que j’ai likées</h3>
          <ul>
            {likedRecipes.map((recipe) => (
              <li key={recipe.code_recipe}>
                <Link to={`/recettes/${recipe.code_recipe}`} className="liked-recipe-link">
                  <img
                    src={`http://localhost:5002/images/${recipe.picture}`}
                    alt={recipe.recipe_name}
                    width="100"
                  />
                  <div>
                    <p><strong>{recipe.recipe_name}</strong></p>
                    <p>{recipe.description}</p>
                  </div>
                </Link>
                <button onClick={() => handleUnlike(recipe.code_recipe)}>❌ Retirer</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Profile;
