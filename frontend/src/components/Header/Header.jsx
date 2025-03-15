import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./Header.css";
import logo from "../../assets/logo_cinedelices.jpg";
import loginIcon from "../../assets/symbole_connexion_jaune.png";

function Header() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* ✅ Logo bien à gauche */}
        <div className="header-left">
          <img src={logo} alt="Ciné Délices" className="logo" />
        </div>

        {/* ✅ Titre centré + Lien "Recettes" dessous */}
        <div className="header-center">
          <h1 className="site-title">Ciné Délices</h1>
          <Link to="/recipes" className="recipes-link">Recettes</Link>
        </div>

        {/* ✅ Connexion / Inscription bien à droite */}
        <div className="header-right">
          {user ? (
            <>
              <Link to="/profile" className="profile-link">Profil</Link>
              <button onClick={handleLogout} className="logout">Déconnexion</button>
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
