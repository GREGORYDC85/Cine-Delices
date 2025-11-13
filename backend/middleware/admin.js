const authorizeAdmin = (req, res, next) => {
  // Vérification de l'authentification
  if (!req.user) {
    req.logger?.warn("⚠️ Tentative d'accès admin sans utilisateur authentifié.");
    return res.status(403).json({
      error: "Accès refusé. Vous devez être connecté pour accéder à cette ressource."
    });
  }

  // Vérification du rôle admin
  if (req.user.role !== "admin") {
    req.logger?.warn(`⚠️ Tentative d'accès admin par un utilisateur non-admin (ID: ${req.user.id}, Rôle: ${req.user.role}).`);
    return res.status(403).json({
      error: "Accès refusé. Réservé aux administrateurs."
    });
  }

  // Log de l'accès réussi (optionnel)
  req.logger?.info(`✅ Accès admin autorisé pour l'utilisateur ${req.user.id} (${req.user.email}).`);
  next();
};

module.exports = authorizeAdmin;
