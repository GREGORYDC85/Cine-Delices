import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminWorks.css";

function AdminWorks() {
  const [works, setWorks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");

  const token = localStorage.getItem("token");

  // 🔄 Charger les œuvres existantes
  const fetchWorks = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/works`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setWorks(res.data))
      .catch((err) => console.error("❌ Erreur chargement des œuvres :", err));
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  // ➕ Ajouter une œuvre
  const handleAdd = () => {
    if (!newTitle.trim()) return;

    axios
      .post(
        `${import.meta.env.VITE_API_URL}/admin/works`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setNewTitle("");
        fetchWorks();
      })
      .catch((err) => console.error("❌ Erreur ajout œuvre :", err));
  };

  // ✏️ Modifier une œuvre
  const handleEdit = (id) => {
    if (!editedTitle.trim()) return;

    axios
      .put(
        `${import.meta.env.VITE_API_URL}/admin/works/${id}`,
        { title: editedTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setEditingId(null);
        setEditedTitle("");
        fetchWorks();
      })
      .catch((err) => console.error("❌ Erreur modification œuvre :", err));
  };

  // 🗑️ Supprimer une œuvre
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
    <div className="admin-works-container">
      <h1>🎬 Gestion des œuvres</h1>

      <div className="add-work-form">
        <input
          type="text"
          placeholder="Titre du film ou de la série"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button onClick={handleAdd}>➕ Ajouter</button>
      </div>

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
                  />
                ) : (
                  work.title
                )}
              </td>
              <td>
                {editingId === work.code_work ? (
                  <>
                    <button onClick={() => handleEdit(work.code_work)}>💾</button>
                    <button onClick={() => setEditingId(null)}>❌</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(work.code_work);
                        setEditedTitle(work.title);
                      }}
                    >
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(work.code_work)}>🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminWorks;
