// Crea o actualiza el usuario del panel con ADMIN_USUARIO y ADMIN_PASSWORD del .env.
// NO borra nada: sirve para cambiar la contraseña sin perder las unidades ni las consultas.
//
//   npm run db:admin

require("dotenv").config({ quiet: true });
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const DB = process.env.DB_NAME || "kovak_automotores";
const USUARIO = (process.env.ADMIN_USUARIO || "").trim().toLowerCase();
const CLAVE = process.env.ADMIN_PASSWORD || "";
const NOMBRE = process.env.ADMIN_NOMBRE || "Administrador";

(async () => {
  if (!USUARIO || CLAVE.length < 8) {
    console.error("❌ Completá ADMIN_USUARIO y ADMIN_PASSWORD (mínimo 8 caracteres) en el .env.");
    process.exit(1);
  }

  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || undefined,
    database: DB,
  });

  try {
    // Bases creadas con la versión anterior: la columna se llamaba "email"
    const [columnas] = await conexion.query("SHOW COLUMNS FROM usuarios LIKE 'email'");
    if (columnas.length) {
      console.log("→ Actualizando la tabla usuarios (email → usuario)…");
      await conexion.query("ALTER TABLE usuarios CHANGE email usuario VARCHAR(60) NOT NULL");
      await conexion.query("ALTER TABLE usuarios RENAME INDEX uq_usuarios_email TO uq_usuarios_usuario").catch(() => {});
    }

    const hash = await bcrypt.hash(CLAVE, 10);
    const [filas] = await conexion.query("SELECT id FROM usuarios ORDER BY id LIMIT 1");
    if (filas.length) {
      // Hay un solo admin: se le cambian usuario, nombre y clave
      await conexion.query("UPDATE usuarios SET usuario = ?, nombre = ?, clave = ? WHERE id = ?", [USUARIO, NOMBRE, hash, filas[0].id]);
      console.log(`✅ Admin actualizado: usuario "${USUARIO}" con la clave del .env.`);
    } else {
      await conexion.query("INSERT INTO usuarios (nombre, usuario, clave) VALUES (?, ?, ?)", [NOMBRE, USUARIO, hash]);
      console.log(`✅ Admin creado: usuario "${USUARIO}" con la clave del .env.`);
    }
  } catch (error) {
    console.error("❌ No se pudo actualizar el admin:", error.message);
    console.error("   Si la base todavía no existe, corré primero: npm run db:instalar");
    process.exitCode = 1;
  } finally {
    await conexion.end();
  }
})();
