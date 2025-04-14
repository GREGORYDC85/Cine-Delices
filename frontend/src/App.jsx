import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Breadcrumb from "./components/Breadcrumb"; // ✅ Fil d'Ariane ajouté
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
import NotFound from "./components/NotFound";
import "./styles/global.css";

// ✅ Pages admin
import AdminRecettes from "./pages/AdminRecettes";
import AdminUtilisateurs from "./pages/AdminUtilisateurs";
import AdminCommentaires from "./pages/AdminCommentaires";
import AdminWorks from "./pages/AdminWorks";

function App() {
  return (
    <Router>
      <Header />
      <Breadcrumb /> {/* ✅ Insertion du fil d'Ariane ici */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recettes/:id" element={<RecipeDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sitemap" element={<PlanDuSite />} />
          <Route path="/legal-mentions" element={<MentionsLegales />} />

          {/* ✅ Dashboard admin protégé */}
          <Route
            path="/admin/dashboard"
            element={<PrivateRoute element={<Dashboard />} adminOnly={true} />}
          />
          <Route
            path="/admin/recettes"
            element={<PrivateRoute element={<AdminRecettes />} adminOnly={true} />}
          />
          <Route
            path="/admin/utilisateurs"
            element={<PrivateRoute element={<AdminUtilisateurs />} adminOnly={true} />}
          />
          <Route
            path="/admin/commentaires"
            element={<PrivateRoute element={<AdminCommentaires />} adminOnly={true} />}
          />
          <Route
            path="/admin/works"
            element={<PrivateRoute element={<AdminWorks />} adminOnly={true} />}
          />

          {/* ❌ Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
