const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();

const router = express.Router();

// ✅ Route d'inscription
router.post("/register", (req, res) => {
  const { name, firstname, email, password } = req.body;

  // Vérifier si l'email existe déjà
  db.query(
    "SELECT * FROM site_user WHERE email = ?",
    [email],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length > 0)
        return res.status(400).json({ error: "Email déjà utilisé" });

      // Hacher le mot de passe
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Insérer l'utilisateur avec le rôle par défaut "user"
      db.query(
        "INSERT INTO site_user (name, firstname, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [name, firstname, email, hashedPassword, "user"],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: "Utilisateur créé avec succès" });
        }
      );
    }
  );
});

// ✅ Route de connexion
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM site_user WHERE email = ?",
    [email],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0)
        return res.status(400).json({ error: "Utilisateur non trouvé" });

      const user = result[0];

      // Vérification du mot de passe
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }

      // ✅ Générer le token JWT avec l'ID, l'email et le rôle
      const token = jwt.sign(
        { id: user.code_user, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ message: "Connexion réussie", token });
    }
  );
});

module.exports = router;
