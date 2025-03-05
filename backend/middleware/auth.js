const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization"); // Récupère le token
  console.log("Token reçu :", token); // 🔥 Vérifie si le token arrive bien

  if (!token) {
    console.log("❌ Aucun token reçu !");
    return res.status(401).json({ error: "Accès refusé. Aucun token fourni." });
  }

  try {
    const cleanToken = token.replace("Bearer ", ""); // Supprime "Bearer "
    console.log("Token nettoyé :", cleanToken); // 🔥 Vérifie le token avant vérification

    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    console.log("✅ Token décodé :", decoded); // 🔥 Vérifie si le token est valide

    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Erreur JWT :", err.message); // 🔥 Affiche l'erreur exacte
    res.status(400).json({ error: "Token invalide." });
  }
};

module.exports = authenticateUser;
