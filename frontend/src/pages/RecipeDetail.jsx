import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./RecipeDetail.css"; // Ajoute un fichier CSS pour la mise en page

function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/recipes/${id}`)
      .then((response) => {
        console.log(`✅ Recette ${id} récupérée :`, response.data);
        setRecipe(response.data);
      })
      .catch((error) => console.error("❌ Erreur lors de la récupération de la recette :", error));
  }, [id]);

  if (!recipe) {
    return <p>Chargement de la recette...</p>;
  }

  return (
    <div className="recipe-detail">
      <h1>{recipe.recipe_name}</h1>
      <img src={`/images/${recipe.picture}`} alt={recipe.recipe_name} />
      <p><strong>Catégorie :</strong> {recipe.category}</p>
      <p><strong>Inspiré de :</strong> {recipe.film_serie}</p>
      <p><strong>Description :</strong> {recipe.description}</p>
    </div>
  );
}

export default RecipeDetail;
