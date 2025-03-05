import { useEffect, useState } from "react";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [category, setCategory] = useState(""); // Pour filtrer par catégorie

  useEffect(() => {
    const url = category 
      ? `http://localhost:5000/recipes/category/${category}` 
      : "http://localhost:5000/recipes";

    fetch(url)
      .then((response) => response.json())
      .then((data) => setRecipes(data))
      .catch((error) => console.error("Erreur lors de la récupération :", error));
  }, [category]); // Recharger quand la catégorie change

  return (
    <div className="container">
      <h1>Recettes 🍕🍔🍰</h1>
      <p>Découvrez les plats iconiques issus de vos films et séries préférés !</p>

      {/* 🔽 Menu de filtrage par catégorie */}
      <select onChange={(e) => setCategory(e.target.value)}>
        <option value="">Toutes les recettes</option>
        <option value="Entrée">Entrées</option>
        <option value="Plat">Plats</option>
        <option value="Dessert">Desserts</option>
      </select>

      <ul className="recipe-list">
        {recipes.map((recipe) => (
          <li key={recipe.code_recipe} className="recipe-card">
            <h2>{recipe.recipe_name}</h2>
            {recipe.picture && <img src={recipe.picture} alt={recipe.recipe_name} />}
            <p>{recipe.description}</p>
            <strong>📺 Film / Série : {recipe.film_serie || "Non spécifié"}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Recipes;
