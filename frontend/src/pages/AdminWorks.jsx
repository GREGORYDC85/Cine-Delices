import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./AdminWorks.css";

function AdminWorks() {
  const [works, setWorks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [loading, setLoading] = useState(true); // ✅ État de chargement
  const token = localStorage.getItem("token");

  const fetchWorks = async () => {
    setLoading(true);
    try {
      // ✅ Utilisation du proxy /api
      const res = await axios.get('/api/admin/works', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorks(res.data);
    } catch (err) {
      console.error("❌ Erreur chargement des œuvres :", err);
      toast.error("Impossible de charger la liste des œuvres.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      toast.warning("Le titre ne peut pas être vide.");
      return;
    }
    try {
      await axios.post(
        '/api/admin/works',
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Œuvre ajoutée avec succès !");
      setNewTitle("");
      fetchWorks();
    } catch (err) {
      console.error("❌ Erreur ajout œuvre :", err);
      toast.error("Erreur lors de l'ajout de l'œuvre.");
    }
  };

  const handleEdit = async (id) => {
    if (!editedTitle.trim()) {
      toast.warning("Le titre ne peut pas être vide.");
      return;
    }
    try {
      await axios.put(
        `/api/admin/works/${id}`,
        { title: editedTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Œuvre modifiée avec succès !");
      setEditingId(null);
      setEditedTitle("");
      fetchWorks();
    } catch (err) {
      console.error("❌ Erreur modification œuvre :", err);
      toast.error("Erreur lors de la modification.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Supprimer cette œuvre ? Cette action est irréversible.")) return;
    try {
      await axios.delete(`/api/admin/works/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Œuvre supprimée avec succès.");
      fetchWorks();
    } catch (err) {
      console.error("❌ Erreur suppression œuvre :", err);
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="admin-works-container">
      <h1>🎬 Gestion des œuvres</h1>

      <div className="add-work-form">
        <input
          type="text"
          placeholder="Titre du film ou de la série"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()} // ✅ Ajout avec Entrée
        />
        <button className="btn-add" onClick={handleAdd}>➕ Ajouter</button>
      </div>

      {loading ? (
        <p className="loading">Chargement des œuvres...</p>
      ) : works.length === 0 ? (
        <p>Aucune œuvre trouvée.</p>
      ) : (
        <table className="admin-works-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titre</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {works.map((work) => (
              <tr key={work.code_work}>
                <td>{work.code_work}</td>
                <td>
                  {editingId === work.code_work ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      autoFocus // ✅ Focus automatique pour l'édition
                    />
                  ) : (
                    work.title || "—" // ✅ Fallback pour titre manquant
                  )}
                </td>
                <td>
                  {editingId === work.code_work ? (
                    <>
                      <button
                        className="btn-save"
                        onClick={() => handleEdit(work.code_work)}
                      >
                        💾 Enregistrer
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => {
                          setEditingId(null);
                          setEditedTitle("");
                        }}
                      >
                        ❌ Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setEditingId(work.code_work);
                          setEditedTitle(work.title);
                        }}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(work.code_work)}
                      >
                        🗑️ Supprimer
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminWorks;
