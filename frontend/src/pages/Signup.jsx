import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Signup.css"; // ✅ Import du fichier CSS

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/signup`, { email, password });

      toast.success("🎉 Inscription réussie ! Vous pouvez vous connecter.");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      
    } catch (err) {
      toast.error("❌ Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="form-box">
        <h1>Inscription 📝</h1>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          <button type="submit" disabled={loading}>{loading ? "Inscription..." : "S'inscrire"}</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
