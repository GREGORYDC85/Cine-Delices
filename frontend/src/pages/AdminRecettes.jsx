import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminRecettes.css";

function AdminRecettes() {
  const [recipes, setRecipes] = useState([]);
  const [works, setWorks] = useState([]);
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    picture: "",
    total_time: "",
    servings: "",
    author: "",
    description: "",
    instruction: "",
    code_category: "",
    code_work: "",
    new_work_title: "",
  });
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRecipes();
    fetchWorks();
  }, []);

  const fetchRecipes = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/recettes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("📦 Données recettes reçues :", res.data); // 🐛 Debug
        setRecipes(res.data);
      })
      .catch((err) =>
        console.error("❌ Erreur récupération des recettes :", err)
      );
  };

  const fetchWorks = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/works`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setWorks(res.data))
      .catch((err) =>
        console.error("❌ Erreur récupération des œuvres :", err)
      );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: value });
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const removeIngredientField = (index) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
  };

  const resetForm = () => {
    setNewRecipe({
      name: "",
      picture: "",
      total_time: "",
      servings: "",
      author: "",
      description: "",
      instruction: "",
      code_category: "",
      code_work: "",
      new_work_title: "",
    });
    setIngredients([{ name: "", quantity: "" }]);
    setEditingId(null);
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();

    const cleanedIngredients = ingredients
      .filter((ing) => ing.name.trim() && ing.quantity.trim())
      .map((ing) => ({
        name: ing.name.trim(),
        quantity: ing.quantity.trim(),
      }));

    const cleanedData = {
      ...newRecipe,
      code_work: newRecipe.code_work || null,
      new_work_title: newRecipe.new_work_title?.trim() || null,
      ingredients: cleanedIngredients,
    };

    const url =
      `${import.meta.env.VITE_API_URL}/admin/recettes` +
      (editingId ? `/${editingId}` : "");
    const method = editingId ? "put" : "post";

    axios[method](url, cleanedData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        fetchRecipes();
        resetForm();
      })
      .catch((err) =>
        console.error(
          `❌ Erreur lors de l'${editingId ? "édition" : "ajout"} :`,
          err
        )
      );
  };

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer cette recette ?")) return;
    axios
      .delete(`${import.meta.env.VITE_API_URL}/admin/recettes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => fetchRecipes())
      .catch((err) => console.error("❌ Erreur suppression :", err));
  };

  const handleEditClick = async (recipe) => {
    setEditingId(recipe.code_recipe);
    setNewRecipe({
      name: recipe.name,
      picture: recipe.picture,
      total_time: recipe.total_time || "",
      servings: recipe.servings || "",
      author: recipe.author || "",
      description: recipe.description || "",
      instruction: recipe.instruction || "",
      code_category: recipe.code_category || "",
      code_work: recipe.code_work || "",
      new_work_title: "",
    });

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/recipes/${recipe.code_recipe}`
      );
      if (res.data.ingredients) {
        const parsed = res.data.ingredients.split(", ").map((item) => {
          const [name, qty] = item.split(" (");
          return {
            name: name.trim(),
            quantity: qty ? qty.replace(")", "").trim() : "",
          };
        });
        setIngredients(parsed);
      } else {
        setIngredients([{ name: "", quantity: "" }]);
      }
    } catch (err) {
      console.error("❌ Erreur chargement ingrédients :", err);
      setIngredients([{ name: "", quantity: "" }]);
    }
  };

  return (
    <div className="admin-recettes-container">
      <h1>📖 Gestion des Recettes</h1>

      <form className="add-recipe-form" onSubmit={handleAddOrUpdate}>
        <h2>{editingId ? "✏️ Modifier la recette" : "➕ Ajouter une recette"}</h2>

        <input
          name="name"
          value={newRecipe.name}
          onChange={handleInputChange}
          placeholder="Nom de la recette"
          required
        />
        <input
          name="picture"
          value={newRecipe.picture}
          onChange={handleInputChange}
          placeholder="Image (nom_fichier.jpg)"
          required
        />
        <input
          name="total_time"
          value={newRecipe.total_time}
          onChange={handleInputChange}
          placeholder="Temps total (min)"
          type="number"
        />
        <input
          name="servings"
          value={newRecipe.servings}
          onChange={handleInputChange}
          placeholder="Portions"
          type="number"
        />
        <input
          name="author"
          value={newRecipe.author}
          onChange={handleInputChange}
          placeholder="Auteur"
        />
        <textarea
          name="description"
          value={newRecipe.description}
          onChange={handleInputChange}
          placeholder="Description"
        />
        <textarea
          name="instruction"
          value={newRecipe.instruction}
          onChange={handleInputChange}
          placeholder="Instructions"
        />

        <select
          name="code_category"
          value={newRecipe.code_category}
          onChange={handleInputChange}
          required
        >
          <option value="">-- Catégorie --</option>
          <option value="1">Entrée</option>
          <option value="2">Plat</option>
          <option value="3">Dessert</option>
        </select>

        <select
          name="code_work"
          value={newRecipe.code_work}
          onChange={handleInputChange}
        >
          <option value="">-- Œuvre existante --</option>
          {works.map((w) => (
            <option key={w.code_work} value={w.code_work}>
              {w.title}
            </option>
          ))}
        </select>

        <input
          name="new_work_title"
          value={newRecipe.new_work_title}
          onChange={handleInputChange}
          placeholder="Ou ajouter une nouvelle œuvre..."
        />

        <h3>🧂 Ingrédients</h3>
        {ingredients.map((ing, index) => (
          <div key={index} className="ingredient-row">
            <input
              type="text"
              placeholder="Nom"
              value={ing.name}
              onChange={(e) =>
                handleIngredientChange(index, "name", e.target.value)
              }
              required
            />
            <input
              type="text"
              placeholder="Quantité"
              value={ing.quantity}
              onChange={(e) =>
                handleIngredientChange(index, "quantity", e.target.value)
              }
              required
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeIngredientField(index)}
              >
                ❌
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addIngredientField}>
          ➕ Ajouter un ingrédient
        </button>

        <button type="submit" className="add-btn">
          {editingId ? "✅ Mettre à jour" : "✅ Ajouter"}
        </button>
        {editingId && (
          <button type="button" className="cancel-btn" onClick={resetForm}>
            ❌ Annuler
          </button>
        )}
      </form>

      <hr />

      {recipes.length === 0 ? (
        <p>Aucune recette à afficher.</p>
      ) : (
        <table className="admin-recette-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Auteur</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe.code_recipe}>
                <td>{recipe.code_recipe}</td>
                <td>{recipe.name}</td>
                <td>{recipe.code_category}</td>
                <td>{recipe.author}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditClick(recipe)}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(recipe.code_recipe)}
                  >
                    🗑️ Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminRecettes;
