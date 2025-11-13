import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // ✅ Remplace les alert() par des toasts
import "./AdminCommentaires.css";

function AdminCommentaires() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Ajout d'un état de chargement
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      // ✅ Utilisation du proxy /api au lieu de VITE_API_URL
      const res = await axios.get('/api/admin/comments/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
    } catch (err) {
      console.error("❌ Erreur récupération des commentaires (admin) :", err);
      toast.error("Impossible de charger les commentaires."); // ✅ Toast à la place de alert()
    } finally {
      setLoading(false);
    }
  };

  const approveComment = async (id) => {
    try {
      await axios.put(`/api/admin/comments/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Commentaire approuvé !"); // ✅ Feedback utilisateur
      fetchComments();
    } catch (err) {
      console.error("❌ Erreur approbation :", err);
      toast.error("Erreur lors de l'approbation.");
    }
  };

  const deleteComment = async (id) => {
    if (!window.confirm("⚠️ Supprimer ce commentaire ? Cette action est irréversible.")) return;
    try {
      await axios.delete(`/api/admin/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Commentaire supprimé !"); // ✅ Feedback utilisateur
      fetchComments();
    } catch (err) {
      console.error("❌ Erreur suppression :", err);
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="admin-comments-container">
      <h1>📝 Gestion des Commentaires</h1>

      {loading ? (
        <p className="loading">Chargement des commentaires...</p> // ✅ État de chargement
      ) : comments.length === 0 ? (
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
                <td>{com.pseudo || "Anonyme"}</td> {/* ✅ Fallback pour pseudo manquant */}
                <td>{com.recipe_name || "Recette inconnue"}</td> {/* ✅ Fallback pour recipe_name */}
                <td className="comment-text">{com.description}</td> {/* ✅ Classe pour le style */}
                <td>{new Date(com.created_at).toLocaleString("fr-FR")}</td>
                <td>
                  <span className={com.is_approved ? "status-approved" : "status-pending"}>
                    {com.is_approved ? "✅ Approuvé" : "🕒 En attente"}
                  </span>
                </td>
                <td>
                  {!com.is_approved && (
                    <button
                      className="btn-approve"
                      onClick={() => approveComment(com.code_comment)}
                    >
                      ✅ Approuver
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => deleteComment(com.code_comment)}
                  >
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
