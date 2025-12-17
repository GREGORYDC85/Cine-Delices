const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db"); // ✅ Connexion MySQL unique

const app = express();

// =======================
// MIDDLEWARES GLOBAUX
// =======================
app.use(cors());
app.use(express.json());
app.use("/images", express.static("public/images"));

// =======================
// IMPORT DES ROUTES
// =======================
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const recipesRoutes = require("./routes/recipes.routes");
const likeRoutes = require("./routes/likes.routes");

const adminRoutes = require("./routes/admin.routes");
const adminWorksRoutes = require("./routes/adminWorks.routes");
const adminUsersRoutes = require("./routes/adminUsers.routes");
const adminRecettesRoutes = require("./routes/adminRecettes.routes");
const commentRoutes = require("./routes/comments.routes");

// =======================
// MONTAGE DES ROUTES
// =======================

// 🔐 Authentification
app.use("/auth", authRoutes);

// 👤 Profil utilisateur
app.use("/api/profile", profileRoutes);

// 🍽️ Recettes (listing + détail)
app.use("/recipes", recipesRoutes);

// ❤️ Likes / favoris
app.use("/api/likes", likeRoutes);

// 💬 Commentaires
app.use("/api/comments", commentRoutes);

// 🛠️ Admin
app.use("/admin", adminRoutes);
app.use("/admin/works", adminWorksRoutes);
app.use("/admin/users", adminUsersRoutes);
app.use("/admin/recettes", adminRecettesRoutes);

// =======================
// ROUTE TEST
// =======================
app.get("/", (req, res) => {
  res.send("🚀 API CineDélices fonctionne !");
});

// =======================
// LANCEMENT SERVEUR
// =======================
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
