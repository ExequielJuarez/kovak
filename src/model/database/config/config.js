// Configuración de la base de datos (la usan Sequelize y sequelize-cli).
// Los datos de conexión salen del archivo .env (ver .env.example).
require("dotenv").config({ quiet: true });

const base = {
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || "kovak_automotores",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  dialect: "mysql",
  // Zona horaria de las fechas (Argentina por defecto)
  timezone: process.env.DB_TIMEZONE || "-03:00",
  logging: process.env.DB_LOG === "true" ? console.log : false,
  pool: { max: Number(process.env.DB_POOL_MAX) || 5, min: 0, idle: 10000, acquire: 30000 },
  dialectOptions: { decimalNumbers: true },
  define: {
    underscored: true,
    freezeTableName: true,
    createdAt: "creado_en",
    updatedAt: "actualizado_en",
  },
};

module.exports = {
  development: base,
  test: { ...base, database: process.env.DB_NAME_TEST || `${base.database}_test` },
  production: base,
};
