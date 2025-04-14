import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css"; // 🔹 Assure-toi que le fichier CSS est bien importé

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5002`;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });

      localStorage.setItem("token", data.token);
      const user = jwtDecode(data.token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("🎉 Connexion réussie !");
      setTimeout(() => {
        navigate("/");
      }, 1000);
      
    } catch (err) {
      toast.error("❌ Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="form-box">
        <h1>Connexion 🔑</h1>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          <button type="submit" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
