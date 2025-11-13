import { Routes, Route } from "react-router-dom"; // ✅ On retire BrowserRouter (déjà dans main.jsx)
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Breadcrumb from "./components/Breadcrumb/Breadcrumb";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import PlanDuSite from "./pages/PlanDuSite";
import MentionsLegales from "./pages/MentionsLegales";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./components/NotFound/NotFound";
import "./styles/global.css";

// ✅ Import des pages admin (ajoute ces imports si manquants)
import AdminRecettes from "./pages/AdminRecettes";
import AdminUtilisateurs from "./pages/AdminUtilisateurs";
import AdminCommentaires from "./pages/AdminCommentaires";
import AdminWorks from "./pages/AdminWorks";

function App() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recettes/:id" element={<RecipeDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
          <Route path="/sitemap" element={<PlanDuSite />} />
          <Route path="/legal-mentions" element={<MentionsLegales />} />

          {/* ✅ Routes admin imbriquées (sans <Router> ici) */}
          <Route path="/admin">
            <Route path="dashboard" element={<PrivateRoute element={<Dashboard />} adminOnly />} />
            <Route path="recettes" element={<PrivateRoute element={<AdminRecettes />} adminOnly />} />
            <Route path="utilisateurs" element={<PrivateRoute element={<AdminUtilisateurs />} adminOnly />} />
            <Route path="commentaires" element={<PrivateRoute element={<AdminCommentaires />} adminOnly />} />
            <Route path="works" element={<PrivateRoute element={<AdminWorks />} adminOnly />} />
          </Route>

          {/* ✅ Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
