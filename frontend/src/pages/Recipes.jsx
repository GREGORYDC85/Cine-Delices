import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./Recipes.css";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const location = useLocation();

  // 🔍 Extraire la recherche depuis l'URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/recipes`)
      .then((response) => {
        setRecipes(response.data);
      })
      .catch((error) => console.error("❌ Erreur lors de la récupération :", error));
  }, []);

  // 📌 Filtrer selon la recherche
  const filteredRecipes = recipes.filter((recipe) => {
    return (
      recipe.recipe_name.toLowerCase().includes(searchQuery) ||
      recipe.film_serie?.toLowerCase().includes(searchQuery) ||
      recipe.ingredients?.toLowerCase().includes(searchQuery)
    );
  });

  // 📌 Organiser les recettes par catégorie
  const categories = ["Entrée", "Plat", "Dessert"];
  const recipesByCategory = categories.map(category => ({
    name: category,
    recipes: filteredRecipes.filter(recipe => recipe.category === category)
  }));

  return (
    <div className="recipes-container">
      <h1>🍽️ Recettes inspirées du cinéma et des séries</h1>

      {recipesByCategory.map(({ name, recipes }) => (
        <div key={name} className="category-section">
          <h2 className="category-title">{name}</h2>
          <div className="recipe-list">
            {recipes.length === 0 ? (
              <p>Aucune recette trouvée pour cette catégorie.</p>
            ) : (
              recipes.map((recipe) => (
                <Link to={`/recipe/${recipe.code_recipe}`} key={recipe.code_recipe} className="recipe-card">
                  <img src={`${import.meta.env.VITE_API_URL}/images/${recipe.picture}`} alt={recipe.recipe_name} />
                  <h3>{recipe.recipe_name}</h3>
                  <p><strong>Inspiré de :</strong> {recipe.film_serie}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Recipes;
