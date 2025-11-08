// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

function authenticateUser(req, res, next) {
  // ✅ Récupère le token dans les headers, insensible à la casse
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("❌ Aucun token Bearer trouvé dans l'en-tête Authorization");
    return res.status(401).json({ error: "Accès refusé. Token manquant." });
  }

  const token = authHeader.split(" ")[1]; // Garde seulement le token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    console.log("✅ Utilisateur authentifié :", req.user);
    next();
  } catch (err) {
    console.error("❌ Erreur JWT :", err.message);
    return res.status(401).json({ error: "Token invalide ou expiré." });
  }
}

module.exports = authenticateUser;
