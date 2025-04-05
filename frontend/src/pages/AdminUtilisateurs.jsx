import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminUtilisateurs.css";

function AdminUtilisateurs() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  // 🔁 Charger les utilisateurs
  const fetchUsers = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) =>
        console.error("❌ Erreur chargement utilisateurs :", err)
      );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔁 Changer le rôle
  const handleRoleChange = (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    axios
      .put(
        `${import.meta.env.VITE_API_URL}/admin/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => fetchUsers())
      .catch((err) =>
        console.error("❌ Erreur changement rôle utilisateur :", err)
      );
  };

  // 🗑️ Supprimer un utilisateur
  const handleDelete = (id) => {
    if (!window.confirm("Confirmer la suppression de cet utilisateur ?")) return;

    axios
      .delete(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => fetchUsers())
      .catch((err) =>
        console.error("❌ Erreur suppression utilisateur :", err)
      );
  };

  return (
    <div className="admin-users-container">
      <h1>👥 Gestion des utilisateurs</h1>
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
              <td>{u.pseudo}</td>
              <td>{u.email}</td>
              <td>{u.firstname}</td>
              <td>{u.name}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleRoleChange(u.code_user, u.role)}>
                  🔁 Rôle
                </button>
                <button onClick={() => handleDelete(u.code_user)}>🗑️ Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUtilisateurs;
