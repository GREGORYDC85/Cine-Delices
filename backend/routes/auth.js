const express = require("express");
const router = express.Router(); // ✅ Définition du router Express
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();

// ✅ Route d'inscription
router.post("/register", (req, res) => {
  const { name, firstname, email, password } = req.body;
  console.log("📩 Tentative d'inscription avec :", email);

  // Vérifier si l'email existe déjà
  db.query(
    "SELECT * FROM site_user WHERE email = ?",
    [email],
    (err, result) => {
      if (err) {
        console.error("❌ Erreur SQL (SELECT) :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      if (result.length > 0) {
        console.log("⚠️ Email déjà utilisé :", email);
        return res.status(400).json({ error: "Email déjà utilisé" });
      }

      // Hachage du mot de passe
      console.log("🔑 Hachage du mot de passe...");
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      console.log("✅ Mot de passe haché :", hashedPassword);

      // Insertion de l'utilisateur dans la BDD
      db.query(
        "INSERT INTO site_user (name, firstname, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [name, firstname, email, hashedPassword, "user"],
        (err, result) => {
          if (err) {
            console.error("❌ Erreur SQL (INSERT) :", err);
            return res.status(500).json({ error: "Erreur serveur" });
          }
          console.log("🎉 Utilisateur créé avec succès :", email);
          res.status(201).json({ message: "Utilisateur créé avec succès" });
        }
      );
    }
  );
});

// ✅ Route de connexion (login)
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("📩 Tentative de connexion avec :", email);

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
        return res.status(400).json({ error: "Utilisateur non trouvé" });
      }

      const user = result[0];
      console.log("✅ Utilisateur trouvé :", user.email);

      // Vérification du mot de passe
      console.log("🔑 Mot de passe reçu :", password);
      console.log("🔐 Mot de passe stocké (haché) :", user.password);

      if (!bcrypt.compareSync(password, user.password)) {
        console.log("❌ Mot de passe incorrect !");
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }

      // ✅ Génération du token JWT
      const token = jwt.sign(
        { id: user.code_user, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      console.log("✅ Connexion réussie ! Token généré.");
      res.json({ message: "Connexion réussie", token });
    }
  );
});

module.exports = router;
