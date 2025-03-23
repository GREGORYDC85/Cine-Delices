import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import PlanDuSite from "./pages/PlanDuSite";  // ✅ Assure-toi que c'est bien le bon fichier
import MentionsLegales from "./pages/MentionsLegales";  // ✅ Assure-toi que c'est bien le bon fichier
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./components/NotFound";
import "./styles/global.css";

function App() {
  return (
    <Router>
      <Header />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sitemap" element={<PlanDuSite />} />  {/* 📌 Plan du site */}
          <Route path="/legal-mentions" element={<MentionsLegales />} />  {/* 📌 Mentions légales */}
          <Route path="/admin/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="*" element={<NotFound />} /> {/* Page 404 */}
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;