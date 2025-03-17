import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./RecipeDetail.css";

function RecipeDetail() {
  const { id } = useParams(); // Récupère l'ID depuis l'URL
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/recipes/${id}`)
      .then((response) => {
        setRecipe(response.data);
      })
      .catch((error) => console.error("❌ Erreur lors de la récupération :", error));
  }, [id]);

  if (!recipe) return <p>Chargement...</p>;

  return (
    <div className="recipe-detail">
      {/* 📌 Titre de la recette */}
      <h1>{recipe.recipe_name}</h1>

      {/* 📌 Image de la recette */}
      <img 
        src={`${import.meta.env.VITE_API_URL}/images/${recipe.picture}`} 
        alt={recipe.recipe_name} 
        className="recipe-image"
      />

      {/* 📌 Informations générales */}
      <p><strong>Catégorie :</strong> {recipe.category}</p>
      <p><strong>Inspiré de :</strong> {recipe.film_serie}</p>
      <p><strong>Description :</strong> {recipe.description}</p>

      {/* 📌 Ingrédients */}
      {recipe.ingredients ? (
        <div>
          <h2>🛒 Ingrédients :</h2>
          <ul>
            {recipe.ingredients.split(", ").map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>❌ Aucun ingrédient renseigné.</p>
      )}

      {/* 📌 Instructions (si elles existent en BDD) */}
      {recipe.instruction ? (
        <div>
          <h2>👨‍🍳 Instructions :</h2>
          <p>{recipe.instruction}</p>
        </div>
      ) : (
        <p>❌ Aucune instruction disponible.</p>
      )}
    </div>
  );
}

export default RecipeDetail;
