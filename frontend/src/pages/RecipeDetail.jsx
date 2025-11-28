// frontend/src/pages/RecipeDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./RecipeDetail.css";
import CommentSection from "../components/CommentSection/CommentSection";
import { jwtDecode } from "jwt-decode";

function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ Utilisation de VITE_API_URL pour l'API backend
    axios.get(`${import.meta.env.VITE_API_URL}/recipes/${id}`)
      .then((response) => {
        setRecipe(response.data);
      })
      .catch((error) => {
        console.error("❌ Erreur lors de la récupération de la recette :", error);
        setError("Impossible de charger la recette.");
      })
      .finally(() => {
        setLoading(false);
      });

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        // ✅ Utilisation de VITE_API_URL pour les likes
        axios.get(`${import.meta.env.VITE_API_URL}/api/likes/${id}`, {
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
          data: { recipeId: id },
        });
        setLiked(false);
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/likes`,
          { recipeId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLiked(true);
      }
    } catch (error) {
      console.error("❌ Erreur lors du like :", error);
    }
  };

  if (loading) return <p className="loading">Chargement...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!recipe) return <p className="error">Recette introuvable.</p>;

  return (
    <div className="recipe-detail">
      <Link to="/recettes" className="back-link">← Retour aux recettes</Link>
      <h1>{recipe.recipe_name || recipe.name}</h1>
      <img
        src={recipe.picture ? `${import.meta.env.VITE_API_URL}/images/${recipe.picture}` : '/placeholder-local.jpg'}
        alt={recipe.recipe_name || recipe.name}
        className="recipe-image"
        onError={(e) => { e.target.src = '/placeholder-local.jpg'; }}
      />
      <div className="recipe-info">
        <p><strong>Catégorie :</strong> {recipe.category || "Non spécifiée"}</p>
        {recipe.film_serie && <p><strong>Inspiré de :</strong> {recipe.film_serie}</p>}
        <p className="description">{recipe.description}</p>

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <>
            <h2>🛒 Ingrédients</h2>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.name} - {ingredient.quantity}
                </li>
              ))}
            </ul>
          </>
        )}

        {recipe.instruction && (
          <>
            <h2>👨‍🍳 Instructions</h2>
            <p className="instruction">{recipe.instruction}</p>
          </>
        )}

        {user && (
          <div className="like-section">
            <button className="like-button" onClick={handleToggleLike}>
              {liked ? "❤️ Retirer des favoris" : "🤍 Ajouter aux favoris"}
            </button>
          </div>
        )}
      </div>
      <CommentSection recipeId={recipe.code_recipe} user={user} />
    </div>
  );
}

export default RecipeDetail;
