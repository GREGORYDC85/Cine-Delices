import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  
  // Vérifier si un token est présent dans le localStorage (indiquant que l'utilisateur est connecté)
  const isAuthenticated = localStorage.getItem('token');

  const handleLogout = () => {
    // Supprimer le token du localStorage pour se déconnecter
    localStorage.removeItem('token');
    navigate('/login'); // Rediriger vers la page de connexion
  };

  return (
    <header className="header">
      <h1>Ciné Délices</h1>
      <nav className="navbar">
        <Link to="/">Accueil</Link>
        <Link to="/recipes">Recettes</Link>
        {/* Si l'utilisateur est connecté, afficher "Mon Profil" et "Déconnexion" */}
        {isAuthenticated && (
          <>
            <Link to="/profile">Mon Profil</Link>
            <Link to="/dashboard">Dashboard</Link>
            <button className="logout-button" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        )}
        {/* Si l'utilisateur n'est pas connecté, afficher "Se connecter" et "S'inscrire" */}
        {!isAuthenticated && (
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
