const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../db");
require("dotenv").config();

const router = express.Router();

/**
 * 🔹 Middleware de validation pour l'inscription et la connexion
 */
const validateUser = [
  body("email").isEmail().withMessage("L'email est invalide."),
  body("password")
    .isLength({ min: 4 })
    .withMessage("Le mot de passe doit contenir au moins 4 caractères."),
];

/**
 * 🔹 Route d'inscription (POST /auth/register)
 */
router.post("/register", validateUser, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, firstname, email, password } = req.body;
  console.log("📩 Tentative d'inscription avec :", email);

  db.query(
    "SELECT * FROM site_user WHERE email = ?",
    [email],
    (err, result) => {
      if (err) {
        console.error("❌ Erreur SQL :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      if (result.length > 0) {
        console.log("⚠️ Email déjà utilisé :", email);
        return res.status(400).json({ error: "Email déjà utilisé." });
      }

      // Hachage du mot de passe
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.error("❌ Erreur lors de la génération du sel :", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }
        bcrypt.hash(password, salt, (err, hashedPassword) => {
          if (err) {
            console.error("❌ Erreur lors du hachage du mot de passe :", err);
            return res.status(500).json({ error: "Erreur serveur" });
          }

          console.log("✅ Mot de passe haché avec succès.");

          // Insérer l'utilisateur dans la base de données
          db.query(
            "INSERT INTO site_user (name, firstname, email, password, role) VALUES (?, ?, ?, ?, ?)",
            [name, firstname, email, hashedPassword, "user"],
            (err) => {
              if (err) {
                console.error("❌ Erreur SQL (INSERT) :", err);
                return res.status(500).json({ error: "Erreur serveur" });
              }
              console.log("🎉 Utilisateur créé avec succès :", email);
              res.status(201).json({ message: "Compte créé avec succès !" });
            }
          );
        });
      });
    }
  );
});

/**
 * 🔹 Route de connexion (POST /auth/login)
 */
router.post("/login", validateUser, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email, password } = req.body;
  console.log("🔄 Tentative de connexion avec :", email);

  db.query(
    "SELECT * FROM site_user WHERE email = ?",
    [email],
    (err, result) => {
      if (err) {
        console.error("❌ Erreur SQL :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      if (result.length === 0) {
        console.log("❌ Utilisateur non trouvé !");
        return res.status(401).json({ error: "Utilisateur non trouvé." });
      }

      const user = result[0];
      console.log("✅ Utilisateur trouvé :", user.email);

      // Vérification du mot de passe
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error(
            "❌ Erreur lors de la comparaison des mots de passe :",
            err
          );
          return res.status(500).json({ error: "Erreur serveur" });
        }
        if (!isMatch) {
          console.log("❌ Mot de passe incorrect !");
          return res.status(401).json({ error: "Mot de passe incorrect." });
        }

        // Génération du token JWT
        const token = jwt.sign(
          {
            id: user.code_user,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" } // ✅ On garde seulement "expiresIn"
        );

        console.log("🔑 Token généré :", token);
        res.json({ message: "Connexion réussie", token });
      });
    }
  );
});

module.exports = router;
