// middleware/admin.js
const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    console.warn("⚠️ Tentative d'accès admin sans utilisateur authentifié.");
    return res.status(403).json({ error: "Accès refusé. Admin uniquement." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé. Admin uniquement." });
  }
  next();
};
module.exports = authorizeAdmin;
