const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * 🔹 GET profil utilisateur
 */
router.get("/", authMiddleware, (req, res) => {
  const userId = req.user.code_user;

  db.query(
    `SELECT code_user, pseudo, description, firstname, name, gender, birthdate, email
     FROM site_user
     WHERE code_user = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results[0]);
    }
  );
});

/**
 * 🔹 UPDATE profil
 */
router.put("/update", authMiddleware, (req, res) => {
  const userId = req.user.code_user;
  const { pseudo, description, firstname, name, gender, birthdate, email } =
    req.body;

  db.query(
    `UPDATE site_user
     SET pseudo=?, description=?, firstname=?, name=?, gender=?, birthdate=?, email=?
     WHERE code_user=?`,
    [pseudo, description, firstname, name, gender, birthdate, email, userId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Profil mis à jour" });
    }
  );
});

/**
 * 🔹 UPDATE mot de passe
 */
router.put("/password", authMiddleware, async (req, res) => {
  const userId = req.user.code_user;
  const { newPassword } = req.body;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  db.query(
    `UPDATE site_user SET password=? WHERE code_user=?`,
    [hashedPassword, userId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Mot de passe mis à jour" });
    }
  );
});

module.exports = router;
