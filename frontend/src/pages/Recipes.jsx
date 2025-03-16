import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Recipes.css";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // Pour filtrer les recettes

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/recipes`)
      .then((response) => {
        setRecipes(response.data);
      })
      .catch((error) => console.error("Erreur lors de la récupération :", error));
  }, []);

  // 📌 Filtrer les recettes en fonction de la catégorie sélectionnée
  const filteredRecipes = selectedCategory
    ? recipes.filter((recipe) => recipe.category === selectedCategory)
    : recipes;

  return (
    <div className="recipes-container">
      <h1>Nos Recettes 🍽️</h1>

      {/* 📌 Boutons de filtrage */}
      <div className="category-buttons">
        <button onClick={() => setSelectedCategory("")}>Toutes</button>
        <button onClick={() => setSelectedCategory("Entrée")}>Entrées</button>
        <button onClick={() => setSelectedCategory("Plat")}>Plats</button>
        <button onClick={() => setSelectedCategory("Dessert")}>Desserts</button>
      </div>

      {/* 📌 Affichage des recettes */}
      <div className="recipes-grid">
        {filteredRecipes.map((recipe) => (
          <div key={recipe.code_recipe} className="recipe-card">
            <img src={`/images/${recipe.picture}`} alt={recipe.recipe_name} />
            <h3>{recipe.recipe_name}</h3>
            <p>{recipe.description}</p>
            <Link to={`/recipe/${recipe.code_recipe}`}>Voir la recette</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recipes;
