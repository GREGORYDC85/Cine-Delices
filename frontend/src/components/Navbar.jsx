import { Link } from 'react-router-dom';

function Navbar({ user }) {  // ⚠️ Ajoute cette prop "user"
  return (
    <nav>
      <Link to="/">Accueil</Link>
      <Link to="/profil">Profil</Link>

      {/* 👇 Correction ici pour afficher uniquement si user.role est admin */}
      {user && user.role === "admin" && (
        <Link to="/admin/dashboard">Dashboard Admin</Link>
      )}
</nav>
  );
}

export default Navbar;
