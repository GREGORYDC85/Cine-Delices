import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ le bon import

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);

    // Vérifie la date d’expiration (facultatif mais utile)
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    return element;
  } catch (error) {
    console.error("❌ Token invalide :", error);
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
