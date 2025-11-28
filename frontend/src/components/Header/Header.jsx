// frontend/src/components/Header/Header.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./Header.css";
import logo from "../../assets/logo_cinedelices.jpg";
import loginIcon from "../../assets/symbole_connexion_jaune.png";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("❌ Erreur de décodage du token :", error);
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed !== "") {
      console.log("🔎 Lancement de la recherche :", trimmed);
      navigate(`/recettes?search=${encodeURIComponent(trimmed)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <img src={logo} alt="Ciné Délices" className="logo" />
          <Link to="/" className="home-link">Accueil</Link>
        </div>
        <div className="header-center">
          <h1 className="site-title">🎬Ciné Délices🍿</h1>
          <nav className="nav-links">
            <Link to="/recettes" className="recipes-link">Recettes</Link>
          </nav>
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Rechercher une recette..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>
        </div>
        <div className="header-right">
          {user ? (
            <>
              <button onClick={handleLogout} className="logout">Déconnexion</button>
              <Link to="/profile" className="profile-link">👤 Profil</Link>
              {user.role === "admin" && (
                <Link to="/admin/dashboard" className="dashboard-link">⚙️ Dashboard</Link>
              )}
            </>
          ) : (
            <div className="login-container">
              <Link to="/login" className="login-link">
                <img src={loginIcon} alt="Connexion" className="login-icon" />
                Se connecter
              </Link>
              <Link to="/signup" className="signup-link">S'inscrire</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
