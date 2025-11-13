const jwt = require("jsonwebtoken");

function authenticateUser(req, res, next) {
  // Vérification de l'en-tête Authorization
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.logger?.warn("❌ Aucun token Bearer trouvé dans l'en-tête Authorization");
    return res.status(401).json({
      error: "Accès refusé. Un token d'authentification est requis."
    });
  }

  // Extraction du token
  const token = authHeader.split(" ")[1];
  if (!token) {
    req.logger?.warn("❌ Token vide dans l'en-tête Authorization");
    return res.status(401).json({ error: "Token manquant." });
  }

  // Vérification et décodage du token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajout des informations utilisateur à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      pseudo: decoded.pseudo, // ✅ Ajout du pseudo si présent dans le token
    };

    // Log de l'authentification réussie
    req.logger?.info(`✅ Utilisateur authentifié : ${decoded.email} (ID: ${decoded.id})`);

    // Passe au middleware suivant
    next();
  } catch (err) {
    // Gestion des erreurs spécifiques
    if (err.name === "TokenExpiredError") {
      req.logger?.warn(`❌ Token expiré pour l'utilisateur (token: ${token.substring(0, 10)}...)`);
      return res.status(401).json({
        error: "Votre session a expiré. Veuillez vous reconnecter."
      });
    } else if (err.name === "JsonWebTokenError") {
      req.logger?.warn(`❌ Token invalide : ${err.message}`);
      return res.status(401).json({
        error: "Token invalide. Veuillez vous reconnecter."
      });
    } else {
      req.logger?.error(`❌ Erreur inattendue lors de la vérification du token : ${err.message}`);
      return res.status(401).json({
        error: "Accès refusé. Une erreur est survenue lors de l'authentification."
      });
    }
  }
}

module.exports = authenticateUser;
