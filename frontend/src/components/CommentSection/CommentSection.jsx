import { useEffect, useState } from "react";
import axios from "axios";
import "./CommentSection.css";

function CommentSection({ recipeId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const token = localStorage.getItem("token");

  // 📥 Récupérer les commentaires
  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5002/api/comments/${recipeId}`
      );
      setComments(response.data);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des commentaires :", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  // ➕ Ajouter un commentaire
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(
        "http://localhost:5002/api/comments",
        { description: newComment, recipeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("❌ Erreur ajout commentaire :", error);
    }
  };

  // ✏️ Modifier un commentaire
  const handleEdit = async (id) => {
    try {
      await axios.put(
        `http://localhost:5002/api/comments/${id}`,
        { description: editedText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentId(null);
      setEditedText("");
      fetchComments();
    } catch (error) {
      console.error("❌ Erreur modification commentaire :", error);
    }
  };

  // 🗑️ Supprimer un commentaire
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5002/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
    } catch (error) {
      console.error("❌ Erreur suppression commentaire :", error);
    }
  };

  // 📅 Formater la date affichée
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="comment-section">
      <h3>💬 Commentaires</h3>

      {/* Formulaire d’ajout */}
      {user && (
        <div className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écris ton commentaire ici..."
          />
          <button onClick={handleAddComment}>Envoyer</button>
        </div>
      )}

      {/* Liste des commentaires */}
      {comments.length === 0 ? (
        <p>Aucun commentaire pour l’instant.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.code_comment}>
              <div className="comment-meta">
                <strong>{comment.pseudo}</strong>
                <span className="comment-date">
                  🕒 {formatDate(comment.created_at)}
                </span>
              </div>

              {editingCommentId === comment.code_comment ? (
                <>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                  <button onClick={() => handleEdit(comment.code_comment)}>
                    💾 Sauvegarder
                  </button>
                  <button onClick={() => setEditingCommentId(null)}>
                    ❌ Annuler
                  </button>
                </>
              ) : (
                <p>{comment.description}</p>
              )}

              {(user?.id === comment.code_user || user?.role === "admin") &&
                editingCommentId !== comment.code_comment && (
                  <div className="comment-actions">
                    {user?.id === comment.code_user && (
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.code_comment);
                          setEditedText(comment.description);
                        }}
                      >
                        ✏️ Modifier
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.code_comment)}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CommentSection;
