import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminCommentaires.css";

function AdminCommentaires() {
  const [comments, setComments] = useState([]);
  const token = localStorage.getItem("token");

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5002";

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, []);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/comments/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
    } catch (err) {
      console.error("❌ Erreur récupération commentaires admin :", err);
      alert("Erreur récupération des commentaires");
    }
  };

  const approveComment = async (id) => {
    try {
      await axios.put(
        `${API_URL}/api/comments/admin/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments();
    } catch (err) {
      console.error("❌ Erreur approbation :", err);
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;

    try {
      await axios.delete(`${API_URL}/api/comments/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
    } catch (err) {
      console.error("❌ Erreur suppression :", err);
    }
  };

  return (
    <div className="admin-comments-container">
      <h1>💬 Gestion des commentaires</h1>

      {comments.length === 0 ? (
        <p>Aucun commentaire.</p>
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
            {comments.map((c) => (
              <tr key={c.code_comment}>
                <td>{c.pseudo}</td>
                <td>{c.recipe_name}</td>
                <td>{c.description}</td>
                <td>
                  {new Date(c.created_at).toLocaleString("fr-FR")}
                </td>
                <td>
                  {c.is_approved ? "✅ Approuvé" : "🕒 En attente"}
                </td>
                <td>
                  {!c.is_approved && (
                    <button onClick={() => approveComment(c.code_comment)}>
                      ✅ Approuver
                    </button>
                  )}
                  <button onClick={() => deleteComment(c.code_comment)}>
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

/* ⬇️⬇️⬇️ C’EST ÇA QUI MANQUAIT ⬇️⬇️⬇️ */
export default AdminCommentaires;
