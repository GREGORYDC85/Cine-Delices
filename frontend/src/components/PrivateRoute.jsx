import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Ce composant vérifie si l'utilisateur est authentifié (avec un token JWT, par exemple)
const PrivateRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si le token JWT existe dans localStorage (ou autre méthode de stockage)
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true); // L'utilisateur est authentifié
    }
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Redirige vers la page de connexion
  }

  return element; // Affiche l'élément si l'utilisateur est authentifié
};

export default PrivateRoute;
