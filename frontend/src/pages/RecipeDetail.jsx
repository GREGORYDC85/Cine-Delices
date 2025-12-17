import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./RecipeDetail.css";

function RecipeDetail() {
  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    `http://${window.location.hostname}:5002`;

  const token = localStorage.getItem("token");

  // =========================
  // 🔄 CHARGEMENT DES DONNÉES
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🍽️ Recette
        const recipeRes = await axios.get(`${API_URL}/recipes/${id}`);
        setRecipe(recipeRes.data);

        setIngredients(
          Array.isArray(recipeRes.data.ingredients)
            ? recipeRes.data.ingredients
            : []
        );

        // 💬 Commentaires validés
        const commentsRes = await axios.get(
          `${API_URL}/api/comments/recipe/${id}`
        );
        setComments(commentsRes.data);

        // ❤️ Like
        if (token) {
          const likeRes = await axios.get(
            `${API_URL}/api/likes/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setLiked(likeRes.data.liked);
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Erreur chargement recette :", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // =========================
  // ❤️ LIKE
  // =========================
  const toggleLike = async () => {
    if (!token) {
      alert("Vous devez être connecté pour liker une recette.");
      return;
    }

    try {
      const method = liked ? "delete" : "post";

      const res = await axios({
        method,
        url: `${API_URL}/api/likes/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLiked(res.data.liked);
    } catch (err) {
      console.error("❌ Erreur like :", err);
    }
  };

  // =========================
  // 💬 AJOUT COMMENTAIRE
  // =========================
  const submitComment = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Vous devez être connecté pour commenter.");
      return;
    }

    if (newComment.trim().length < 2) {
      alert("Commentaire trop court.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/comments/recipe/${id}`,
        { description: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("💬 Commentaire envoyé (en attente de validation)");
      setNewComment("");
    } catch (err) {
      console.error("❌ Erreur envoi commentaire :", err);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!recipe) return <p>Recette introuvable.</p>;

  return (
    <div className="recipe-detail">
      {/* ❤️ LIKE */}
      <button
        className={`like-button ${liked ? "liked" : ""}`}
        onClick={toggleLike}
        type="button"
      >
        {liked ? "❤️" : "🤍"}
      </button>

      <h1>{recipe.name}</h1>

      {recipe.picture && (
        <img
          src={`${API_URL}/images/${recipe.picture}`}
          alt={recipe.name}
          className="recipe-image"
        />
      )}

      <p><strong>Catégorie :</strong> {recipe.category}</p>
      <p><strong>Auteur :</strong> {recipe.author}</p>
      <p>{recipe.description}</p>

      {/* 🧂 INGRÉDIENTS */}
      <h2>Ingrédients</h2>
      <ul>
        {ingredients.map((ing, i) => (
          <li key={i}>
            {ing.name} – {ing.quantity}
          </li>
        ))}
      </ul>

      {/* 📖 INSTRUCTIONS */}
      <h2>Instructions</h2>
      <p>{recipe.instruction}</p>

      {/* 💬 COMMENTAIRES */}
      <section className="comments-section">
        <h2>💬 Commentaires</h2>

        {comments.length === 0 ? (
          <p>Aucun commentaire pour le moment.</p>
        ) : (
          <ul className="comments-list">
            {comments.map((c) => (
              <li key={c.code_comment}>
                <strong>{c.pseudo}</strong> : {c.description}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ✍️ FORMULAIRE COMMENTAIRE */}
      <section className="comment-form">
        <h3>Laisser un commentaire</h3>

        <form onSubmit={submitComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Votre commentaire..."
            rows="4"
          />

          <button type="submit">Envoyer</button>
        </form>
      </section>
    </div>
  );
}

export default RecipeDetail;
