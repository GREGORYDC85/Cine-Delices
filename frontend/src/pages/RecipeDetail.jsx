import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./RecipeDetail.css";

function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/recipes/${id}`)
      .then((response) => {
        setRecipe(response.data);
      })
      .catch((error) =>
        console.error("❌ Erreur lors de la récupération :", error)
      );
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
      <p>
        <strong>Catégorie :</strong> {recipe.category}
      </p>
      <p>
        <strong>Inspiré de :</strong> {recipe.film_serie}
      </p>
      <p>
        <strong>Description :</strong> {recipe.description}
      </p>

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
          {/* whiteSpace: "pre-line" permet d'interpréter les "\n" comme des retours à la ligne */}
          <p style={{ whiteSpace: "pre-line" }}>{recipe.instruction}</p>
        </div>
      ) : (
        <p>❌ Aucune instruction disponible.</p>
      )}
    </div>
  );
}

export default RecipeDetail;
