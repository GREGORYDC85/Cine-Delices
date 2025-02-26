const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé. Admin uniquement." });
  }
  next();
};

module.exports = authorizeAdmin;
