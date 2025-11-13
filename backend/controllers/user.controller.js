// backend/controllers/user.controller.js
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).json({ userId: user._id, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
