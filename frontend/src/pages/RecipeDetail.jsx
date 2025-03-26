import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./RecipeDetail.css";
import CommentSection from "../components/CommentSection/CommentSection";
import { jwtDecode } from "jwt-decode"; // ✅ Pour décoder le token

function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 🔄 Charger les détails de la recette
    axios
      .get(`${import.meta.env.VITE_API_URL}/recipes/${id}`)
      .then((response) => setRecipe(response.data))
      .catch((error) =>
        console.error("❌ Erreur lors de la récupération de la recette :", error)
      );

    // 👤 Décodage du token pour récupérer les infos de l'utilisateur
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("❌ Erreur lors du décodage du token :", error);
      }
    }
  }, [id]);

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

      {/* 💬 Section des commentaires */}
      <CommentSection recipeId={recipe.code_recipe} user={user} />
    </div>
  );
}

export default RecipeDetail;
