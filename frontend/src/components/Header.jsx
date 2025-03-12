import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // ✅ Déclaration correcte du state user

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="header">
      <h1>Ciné Délices</h1>
      <nav className="navbar">
        <Link to="/">Accueil</Link>
        <Link to="/recipes">Recettes</Link>

        {user && user.role === "admin" && (
          <Link to="/admin/dashboard">Dashboard Admin</Link>
        )}

        {user && (
          <>
            <Link to="/profile">Profil</Link>
            <button onClick={handleLogout}>Déconnexion</button>
          </>
        )}

        {!user && (
          <>
            <Link to="/login">Se connecter</Link>
            <Link to="/signup">S'inscrire</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
