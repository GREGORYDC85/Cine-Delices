import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";  // Assurez-vous d'avoir axios installé pour faire des requêtes HTTP

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Envoie de la requête pour se connecter
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      // Vérification de la réponse avant de stocker le token
      console.log("Réponse du serveur:", response);

      if (response.data.token) {
        // Sauvegarder le token dans localStorage
        localStorage.setItem("token", response.data.token);
        console.log("Token sauvegardé:", response.data.token);

        // Rediriger l'utilisateur vers le dashboard ou la page d'accueil
        navigate("/dashboard");
      } else {
        setError("Le token n'a pas été reçu.");
      }
    } catch (err) {
      // Gestion des erreurs renvoyées par le backend
      if (err.response) {
        setError(err.response.data.error || "Une erreur est survenue");
        console.error("Erreur de connexion:", err.response.data.error);
      } else {
        setError("Identifiants incorrects");
        console.error("Erreur de connexion:", err);
      }
    }
  };

  return (
    <div className="container">
      <h1>Connexion 🔑</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}

export default Login;
