import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminCommentaires.css"; // Si tu veux du style

function AdminCommentaires() {
  const [comments, setComments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await axios.get("http://localhost:5002/admin/comments/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
    } catch (err) {
      console.error("❌ Erreur récupération commentaires :", err);
    }
  };

  const approveComment = async (id) => {
    try {
      await axios.put(
        `http://localhost:5002/admin/comments/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchComments(); // Refresh après action
    } catch (err) {
      console.error("❌ Erreur approbation :", err);
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm("❌ Supprimer ce commentaire ?")) return;
    try {
      await axios.delete(`http://localhost:5002/admin/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments(); // Refresh après action
    } catch (err) {
      console.error("❌ Erreur suppression :", err);
    }
  };

  return (
    <div className="admin-comments-container">
      <h1>📝 Gestion des Commentaires</h1>

      {comments.length === 0 ? (
        <p>Aucun commentaire pour le moment.</p>
      ) : (
        <table className="comments-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Recette</th>
              <th>Commentaire</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((com) => (
              <tr key={com.code_comment}>
                <td>{com.pseudo}</td>
                <td>{com.recipe_name}</td>
                <td>{com.description}</td>
                <td>{new Date(com.created_at).toLocaleString("fr-FR")}</td>
                <td>{com.is_approved ? "✅ Approuvé" : "🕒 En attente"}</td>
                <td>
                  {!com.is_approved && (
                    <button onClick={() => approveComment(com.code_comment)}>
                      ✅ Approuver
                    </button>
                  )}
                  <button onClick={() => deleteComment(com.code_comment)}>
                    🗑 Supprimer
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

export default AdminCommentaires;
