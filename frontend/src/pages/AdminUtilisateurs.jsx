import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // ✅ Utilisation des toasts
import "./AdminUtilisateurs.css";

function AdminUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ État de chargement
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // ✅ Utilisation du proxy /api
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Erreur chargement utilisateurs :", err);
      toast.error("Impossible de charger la liste des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await axios.put(
        `/api/admin/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Rôle mis à jour : ${newRole}`);
      fetchUsers();
    } catch (err) {
      console.error("❌ Erreur changement rôle utilisateur :", err);
      toast.error("Erreur lors de la mise à jour du rôle.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Supprimer cet utilisateur ? Cette action est irréversible.")) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Utilisateur supprimé avec succès.");
      fetchUsers();
    } catch (err) {
      console.error("❌ Erreur suppression utilisateur :", err);
      toast.error("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  return (
    <div className="admin-users-container">
      <h1>👥 Gestion des utilisateurs</h1>

      {loading ? (
        <p className="loading">Chargement des utilisateurs...</p>
      ) : users.length === 0 ? (
        <p>Aucun utilisateur trouvé.</p>
      ) : (
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pseudo</th>
              <th>Email</th>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.code_user}>
                <td>{u.code_user}</td>
                <td>{u.pseudo || "—"}</td> {/* ✅ Fallback pour pseudo manquant */}
                <td>{u.email}</td>
                <td>{u.firstname || "—"}</td> {/* ✅ Fallback pour prénom manquant */}
                <td>{u.name || "—"}</td> {/* ✅ Fallback pour nom manquant */}
                <td>
                  <span className={`role-badge ${u.role}`}>
                    {u.role === "admin" ? "👑 Admin" : "👤 Utilisateur"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-role"
                    onClick={() => handleRoleChange(u.code_user, u.role)}
                  >
                    {u.role === "admin" ? "⬇️ Rétrograder" : "⬆️ Promouvoir"}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(u.code_user)}
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

export default AdminUtilisateurs;
