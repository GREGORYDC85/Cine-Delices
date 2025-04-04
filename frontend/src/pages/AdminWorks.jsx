import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminRecettes.css"; // réutilise les styles du dashboard

function AdminWorks() {
  const [works, setWorks] = useState([]);
  const [newWork, setNewWork] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/works`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setWorks(res.data))
      .catch((err) => console.error("❌ Erreur chargement œuvres :", err));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newWork.trim()) return;

    axios
      .post(
        `${import.meta.env.VITE_API_URL}/admin/works`,
        { title: newWork },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        fetchWorks();
        setNewWork("");
      })
      .catch((err) => console.error("❌ Erreur ajout œuvre :", err));
  };

  const handleEdit = (id, title) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    axios
      .put(
        `${import.meta.env.VITE_API_URL}/admin/works/${editingId}`,
        { title: editTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        fetchWorks();
        setEditingId(null);
        setEditTitle("");
      })
      .catch((err) => console.error("❌ Erreur modification œuvre :", err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer cette œuvre ?")) return;

    axios
      .delete(`${import.meta.env.VITE_API_URL}/admin/works/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => fetchWorks())
      .catch((err) => console.error("❌ Erreur suppression œuvre :", err));
  };

  return (
    <div className="admin-recettes-container">
      <h1>🎥 Gestion des œuvres (films / séries)</h1>

      <form className="add-recipe-form" onSubmit={handleAdd}>
        <input
          value={newWork}
          onChange={(e) => setNewWork(e.target.value)}
          placeholder="Titre de l'œuvre"
          required
        />
        <button type="submit" className="add-btn">
          ➕ Ajouter
        </button>
      </form>

      <hr />

      {works.length === 0 ? (
        <p>Aucune œuvre enregistrée.</p>
      ) : (
        <table className="admin-recette-table">
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
                    <form onSubmit={handleEditSubmit}>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                      />
                      <button type="submit" className="edit-btn">
                        ✅
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="cancel-btn"
                      >
                        ❌
                      </button>
                    </form>
                  ) : (
                    work.title
                  )}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(work.code_work, work.title)}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(work.code_work)}
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

export default AdminWorks;
