// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("❌ Aucun token Bearer trouvé dans l'en-tête Authorization");
    return res.status(401).json({ error: "Accès refusé. Token manquant." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expiré. Veuillez vous reconnecter." });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token invalide." });
    } else {
      console.error("❌ Erreur JWT inattendue :", err.message);
      return res.status(401).json({ error: "Accès refusé." });
    }
  }
}
module.exports = authenticateUser;
