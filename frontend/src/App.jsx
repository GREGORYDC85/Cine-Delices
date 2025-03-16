import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";  // ✅ Page de détail des recettes
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import PlanDuSite from "./pages/PlanDuSite";  // ✅ Import de la page Plan du site
import MentionsLegales from "./pages/MentionsLegales";  // ✅ Import de la page Mentions légales
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./components/NotFound";
import "./styles/global.css";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* ✅ Pages principales */}
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} /> {/* ✅ Détail d'une recette */}

        {/* ✅ Authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ Pages générales */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />

        {/* ✅ Page Admin sécurisée */}
        <Route path="/admin/dashboard" element={<PrivateRoute element={<Dashboard />} />} />

        {/* ✅ Pages légales et plan du site */}
        <Route path="/plan-du-site" element={<PlanDuSite />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />

        {/* ✅ Page 404 si aucune route ne correspond */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
