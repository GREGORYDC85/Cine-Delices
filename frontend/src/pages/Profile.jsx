import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

const API_URL = import.meta.env.VITE_API_URL;

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
  const [comments, setComments] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // 👤 PROFIL
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/profile`, { headers });
        setUser(res.data);
      } catch (error) {
        console.error("❌ Erreur récupération profil :", error);
      }
    };

    // ❤️ FAVORIS
    const fetchLikedRecipes = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/likes/user/favorites`,
          { headers }
        );
        setLikedRecipes(res.data);
      } catch (error) {
        console.error("❌ Erreur récupération favoris :", error);
        setLikedRecipes([]);
      }
    };

    // 💬 COMMENTAIRES
    const fetchUserComments = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/comments/user`,
          { headers }
        );
        setComments(res.data);
      } catch (error) {
        console.warn("ℹ️ Aucun commentaire trouvé");
        setComments([]);
      }
    };

    fetchUserData();
    fetchLikedRecipes();
    fetchUserComments();
  }, [token]);

  const handleSave = async () => {
    try {
      const formattedUser = {
        ...user,
        birthdate: user.birthdate
          ? user.birthdate.split("T")[0]
          : null,
      };

      await axios.put(
        `${API_URL}/api/profile/update`,
        formattedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (newPassword) {
        await axios.put(
          `${API_URL}/api/profile/password`,
          { newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNewPassword("");
      }

      alert("✅ Profil mis à jour !");
      setEditing(false);
    } catch (error) {
      console.error("❌ Erreur mise à jour profil :", error);
      alert("⚠️ Une erreur est survenue.");
    }
  };

  const handleUnlike = async (recipeId) => {
    try {
      await axios.delete(`${API_URL}/api/likes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLikedRecipes((prev) =>
        prev.filter((r) => r.code_recipe !== recipeId)
      );
    } catch (error) {
      console.error("❌ Erreur suppression like :", error);
    }
  };

  return (
    <div className="profile-container">
      <h1>👤 Mon Profil</h1>

      {/* ===== PROFIL ===== */}
      {editing ? (
        <div className="profile-form">
          <label>Pseudo</label>
          <input
            value={user.pseudo}
            onChange={(e) =>
              setUser({ ...user, pseudo: e.target.value })
            }
          />

          <label>Description</label>
          <textarea
            value={user.description}
            onChange={(e) =>
              setUser({ ...user, description: e.target.value })
            }
          />

          <label>Prénom</label>
          <input
            value={user.firstname}
            onChange={(e) =>
              setUser({ ...user, firstname: e.target.value })
            }
          />

          <label>Nom</label>
          <input
            value={user.name}
            onChange={(e) =>
              setUser({ ...user, name: e.target.value })
            }
          />

          <label>Email</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) =>
              setUser({ ...user, email: e.target.value })
            }
          />

          <label>Nouveau mot de passe</label>
          <input
            type="password"
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
          <p><strong>Email :</strong> {user.email}</p>
          <button onClick={() => setEditing(true)}>
            ✏️ Modifier
          </button>
        </div>
      )}

      {/* ===== FAVORIS ===== */}
      <section className="liked-recipes">
        <h2>❤️ Mes recettes favorites</h2>

        {likedRecipes.length === 0 ? (
          <p>Aucune recette likée.</p>
        ) : (
          <ul>
            {likedRecipes.map((r) => (
              <li key={r.code_recipe}>
                <Link to={`/recettes/${r.code_recipe}`}>
                  <img
                    src={`${API_URL}/images/${r.picture}`}
                    alt={r.name}
                  />
                  <span>{r.name}</span>
                </Link>
                <button onClick={() => handleUnlike(r.code_recipe)}>
                  ❌
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ===== COMMENTAIRES ===== */}
      <section className="user-comments">
        <h2>💬 Mes commentaires</h2>

        {comments.length === 0 ? (
          <p>Aucun commentaire.</p>
        ) : (
          <ul>
            {comments.map((c) => (
              <li key={c.code_comment}>
                <p>“{c.description}”</p>
                <Link to={`/recettes/${c.code_recipe}`}>
                  Voir la recette
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Profile;
