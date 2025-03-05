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
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // Sauvegarder le token dans le localStorage
      localStorage.setItem("token", response.data.token);

      // Rediriger l'utilisateur vers le dashboard ou la page d'accueil
      navigate("/dashboard");
    } catch (err) {
      setError("Identifiants incorrects");
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
