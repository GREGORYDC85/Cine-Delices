import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./components/NotFound"; // Page 404 personnalisée
import "./styles/global.css"; // Importation des styles globaux
import { useEffect } from "react";

// ✅ Charger l'URL du backend depuis le `.env`
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

if (!API_URL) {
  console.error("❌ Erreur : `VITE_API_URL` non défini dans `.env` !");
}

function App() {
  useEffect(() => {
    console.log("✅ Application chargée avec API_URL :", API_URL);
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
        <Route path="/admin/dashboard" element={<PrivateRoute element={<Dashboard />} requiredRole="admin" />} />
        <Route path="*" element={<NotFound />} /> {/* Page 404 personnalisée */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
