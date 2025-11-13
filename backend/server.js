// ================================
// 🌐 Configuration & Imports
// ================================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // Charge .env uniquement en local
}

const express = require("express");
const mysql = require("mysql2/promise"); // Utilisation de mysql2/promise pour async/await
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();

// ================================
// 🌍 Middleware CORS sécurisé (Render + local)
// ================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://cine-delices-frontend.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("🚫 CORS refusé pour :", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use("/images", express.static("public/images"));

// ================================
// ⚙️ Configuration MySQL (Aiven) - Utilisation d'un pool
// ================================
const dbOptions = {
  host: process.env.DB_HOST?.trim(),
  user: process.env.DB_USER?.trim(),
  password: process.env.DB_PASSWORD?.trim(),
  database: process.env.DB_NAME?.trim(),
  port: Number(process.env.DB_PORT) || 17025,
  connectTimeout: 10000,
  ssl:
    process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
};

console.log("🧩 Configuration MySQL finale :", {
  host: dbOptions.host,
  user: dbOptions.user,
  database: dbOptions.database,
  port: dbOptions.port,
  ssl: !!dbOptions.ssl,
});

const db = mysql.createPool(dbOptions);
db.on("connection", () => console.log("✅ Nouvelle connexion MySQL établie"));
db.on("error", (err) => console.error("❌ Erreur MySQL (pool) :", err));

// ================================
// 🔗 Import des routes
// ================================
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const likesRoutes = require("./routes/likes");
const commentsRoutes = require("./routes/comments");
const userRoutes = require("./routes/user");

// ================================
// 📦 Utilisation des routes
// ================================
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/api/likes", likesRoutes);
app.use("/comments", commentsRoutes);
app.use("/users", userRoutes);

// ================================
// 📡 ROUTES PUBLIQUES
// ================================
app.get("/", (req, res) => {
  res.send("🚀 API CineDélices connectée à Aiven et déployée sur Render !");
});

// 📜 Route : toutes les recettes (liste)
app.get("/recipes", async (req, res) => {
  try {
    const sql = `
      SELECT
        r.code_recipe,
        r.name AS recipe_name,
        r.picture,
        r.description,
        c.name AS category,
        w.title AS film_serie
      FROM recipe r
      LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
      LEFT JOIN category c ON rc.code_category = c.code_category
      LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
      LEFT JOIN work w ON rw.code_work = w.code_work
      ORDER BY r.code_recipe DESC;
    `;
    const [result] = await db.query(sql);
    res.json(result);
  } catch (err) {
    console.error("❌ Erreur SQL (toutes les recettes) :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 📜 Route : recette par ID (avec ingrédients)
app.get("/recipes/:id", async (req, res) => {
  const recipeId = req.params.id;
  const recipeQuery = `
    SELECT
      r.code_recipe,
      r.name AS recipe_name,
      r.picture,
      r.description,
      r.instruction,
      c.name AS category,
      w.title AS film_serie
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
    LEFT JOIN category c ON rc.code_category = c.code_category
    LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    LEFT JOIN work w ON rw.code_work = w.code_work
    WHERE r.code_recipe = ?;
  `;
  const ingredientsQuery = `
    SELECT i.name, i.quantity
    FROM contains co
    JOIN ingredient i ON co.code_ingredient = i.code_ingredient
    WHERE co.code_recipe = ?;
  `;
  try {
    const [recipeResult] = await db.query(recipeQuery, [recipeId]);
    if (recipeResult.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    const [ingredientsResult] = await db.query(ingredientsQuery, [recipeId]);
    const recipe = recipeResult[0];
    recipe.ingredients = ingredientsResult;
    res.json(recipe);
  } catch (err) {
    console.error("❌ Erreur SQL (recette/ingrédients) :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ================================
// 🚀 Lancement du serveur + gestion des erreurs globales
// ================================
app.use((req, res, next) => {
  res.status(404).json({ error: "Route non trouvée" });
});

app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur :", err);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serveur CineDélices lancé sur le port ${PORT}`);
});
