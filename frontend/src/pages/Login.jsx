import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/auth/login", { email, password });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);

        // ✅ Décoder immédiatement l'utilisateur et sauvegarder
        const userDecoded = jwtDecode(response.data.token);
        localStorage.setItem("user", JSON.stringify(userDecoded));

        navigate("/");
      }
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Erreur de connexion");
      }
    }
  }

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