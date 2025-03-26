import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./RecipeDetail.css";
import CommentSection from "../components/CommentSection/CommentSection";
import { jwtDecode } from "jwt-decode";

function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // 🔄 Charger la recette
    axios
      .get(`${import.meta.env.VITE_API_URL}/recipes/${id}`)
      .then((response) => setRecipe(response.data))
      .catch((error) =>
        console.error("❌ Erreur lors de la récupération de la recette :", error)
      );

    // 👤 Décoder le token utilisateur
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);

        // ✅ Vérifie si la recette est déjà likée
        axios
          .get(`${import.meta.env.VITE_API_URL}/api/likes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setLiked(res.data.liked);
          })
          .catch((err) => console.error("❌ Erreur like check :", err));
      } catch (error) {
        console.error("❌ Erreur lors du décodage du token :", error);
      }
    }
  }, [id]);

  const handleToggleLike = async () => {
    const token = localStorage.getItem("token");
    try {
      if (liked) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/likes`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { recipeId: id }, // ✅ N'oublie pas "data" pour DELETE
        });
        setLiked(false);
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/likes`,
          { recipeId: id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLiked(true);
      }
    } catch (error) {
      console.error("❌ Erreur lors du like :", error);
    }
  };

  if (!recipe) return <p>Chargement...</p>;

  return (
    <div className="recipe-detail">
      <h1>{recipe.recipe_name}</h1>

      <img
        src={`${import.meta.env.VITE_API_URL}/images/${recipe.picture}`}
        alt={recipe.recipe_name}
        className="recipe-image"
      />

      <p><strong>Catégorie :</strong> {recipe.category}</p>
      <p><strong>Inspiré de :</strong> {recipe.film_serie}</p>
      <p><strong>Description :</strong> {recipe.description}</p>

      {recipe.ingredients ? (
        <div>
          <h2>🛒 Ingrédients :</h2>
          <ul>
            {recipe.ingredients.split(", ").map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>❌ Aucun ingrédient renseigné.</p>
      )}

      {recipe.instruction ? (
        <div>
          <h2>👨‍🍳 Instructions :</h2>
          <p style={{ whiteSpace: "pre-line" }}>{recipe.instruction}</p>
        </div>
      ) : (
        <p>❌ Aucune instruction disponible.</p>
      )}

      {/* ❤️ Bouton "Ajouter aux favoris" */}
      {user && (
        <div className="like-section">
          <button className="like-button" onClick={handleToggleLike}>
            {liked ? "❤️ Retirer des favoris" : "🤍 Ajouter aux favoris"}
          </button>
        </div>
      )}

      {/* 💬 Commentaires */}
      <CommentSection recipeId={recipe.code_recipe} user={user} />
    </div>
  );
}

export default RecipeDetail;
