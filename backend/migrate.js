require("dotenv").config();
const mysql = require("mysql2/promise"); // version promise pour async/await
const { Client } = require("pg");

async function migrate() {
  // 📌 Connexion MySQL
  const mysqlConn = await mysql.createConnection({
    host: process.env.DB_HOST_MYSQL || "localhost",
    user: process.env.DB_USER_MYSQL || "root",
    password: process.env.DB_PASSWORD_MYSQL || "1234",
    database: process.env.DB_NAME_MYSQL || "cine_delices",
  });

  // 📌 Connexion PostgreSQL
  const pgClient = new Client({
    host: process.env.DB_HOST_PG || "localhost",
    port: process.env.DB_PORT_PG || 5432,
    user: process.env.DB_USER_PG || "postgres",
    password: process.env.DB_PASSWORD_PG || "password",
    database: process.env.DB_NAME_PG || "cine_delices_pg",
  });

  await pgClient.connect();

  console.log("✅ Connecté aux deux bases de données");

  // Exemple : migrer la table "recipe"
  const [rows] = await mysqlConn.execute("SELECT * FROM recipe");

  // Créer la table PostgreSQL si elle n'existe pas
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS recipe (
      code_recipe SERIAL PRIMARY KEY,
      name TEXT,
      picture TEXT,
      description TEXT
    )
  `);

  // Insérer les données MySQL dans PostgreSQL
  for (const row of rows) {
    await pgClient.query(
      `INSERT INTO recipe (code_recipe, name, picture, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (code_recipe) DO NOTHING`,
      [row.code_recipe, row.name, row.picture, row.description]
    );
  }

  console.log(`✅ Migration terminée : ${rows.length} recettes copiées`);

  await mysqlConn.end();
  await pgClient.end();
}

migrate().catch((err) => {
  console.error("❌ Erreur migration :", err);
});
