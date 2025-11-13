require("dotenv").config();
const mysql = require("mysql2/promise");
const { Client } = require("pg");

// Fonction pour mapper les types MySQL → PostgreSQL
function mapType(mysqlType) {
  const mappings = {
    int: "INTEGER",
    varchar: "TEXT",
    text: "TEXT",
    datetime: "TIMESTAMP",
    date: "DATE",
    "tinyint(1)": "BOOLEAN",
    enum: "TEXT",
  };
  return mappings[mysqlType.split("(")[0].toLowerCase()] || "TEXT";
}

// Fonction principale de migration
async function migrate() {
  try {
    // 📌 Connexion MySQL
    const mysqlConn = await mysql.createConnection({
      host: process.env.DB_HOST_MYSQL || "localhost",
      user: process.env.DB_USER_MYSQL || "root",
      password: process.env.DB_PASSWORD_MYSQL || "1234",
      database: process.env.DB_NAME_MYSQL || "cine_delices",
      multipleStatements: true,
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

    // 📌 Récupérer toutes les tables MySQL
    const [tables] = await mysqlConn.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${process.env.DB_NAME_MYSQL || "cine_delices"}'
    `);

    // 📌 Migration table par table
    for (const { table_name: tableName } of tables) {
      if (tableName === "migrations") continue; // Ignorer les tables système

      console.log(`🔄 Migration de la table: ${tableName}`);

      // Récupérer la structure de la table MySQL
      const [columns] = await mysqlConn.query(`
        SHOW COLUMNS FROM ${tableName}
      `);

      // Générer la requête CREATE TABLE pour PostgreSQL
      const columnsDef = columns
        .map((col) => {
          let def = `${col.Field} ${mapType(col.Type)}`;
          if (col.Key === "PRI") def += " PRIMARY KEY";
          if (col.Extra === "auto_increment")
            def += " GENERATED ALWAYS AS IDENTITY";
          if (col.Null === "NO") def += " NOT NULL";
          if (col.Default)
            def += ` DEFAULT ${
              col.Default.includes("'") ? col.Default : `'${col.Default}'`
            }`;
          return def;
        })
        .join(", ");

      // Créer la table dans PostgreSQL
      await pgClient.query(`
        DROP TABLE IF EXISTS ${tableName};
        CREATE TABLE IF NOT EXISTS ${tableName} (${columnsDef})
      `);

      // 📌 Copier les données
      const [rows] = await mysqlConn.query(`SELECT * FROM ${tableName}`);
      if (rows.length > 0) {
        const columnsNames = columns.map((col) => col.Field).join(", ");
        const placeholders = rows[0]
          ? Object.keys(rows[0])
              .map((_, i) => `$${i + 1}`)
              .join(", ")
          : "";

        // Utiliser une transaction pour accélérer l'insertion
        await pgClient.query("BEGIN");
        for (const row of rows) {
          const values = Object.values(row);
          await pgClient.query({
            text: `INSERT INTO ${tableName} (${columnsNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            values,
          });
        }
        await pgClient.query("COMMIT");
        console.log(`✅ ${rows.length} lignes copiées pour ${tableName}`);
      }
    }

    console.log("✅ Migration terminée avec succès !");
  } catch (err) {
    console.error("❌ Erreur migration :", err);
  } finally {
    // Fermer les connexions dans tous les cas
    if (mysqlConn) await mysqlConn.end();
    if (pgClient) await pgClient.end();
  }
}

migrate();
