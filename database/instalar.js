// Crea la base de datos, las tablas, el usuario admin y carga el stock inicial.
// Usa los datos de conexión del .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME...).
//
//   npm run db:instalar            → estructura + admin + 8 unidades de ejemplo
//   npm run db:instalar -- --vacia → estructura + admin, sin unidades
//
// ATENCIÓN: borra y vuelve a crear todas las tablas de DB_NAME.

require("dotenv").config({ quiet: true });
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const DB = process.env.DB_NAME || "kovak_automotores";
const ZONA = process.env.DB_TIMEZONE || "-03:00";
const sinUnidades = process.argv.includes("--vacia");

const ADMIN_USUARIO = (process.env.ADMIN_USUARIO || "").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_NOMBRE = process.env.ADMIN_NOMBRE || "Administrador";

const esquema = fs
  .readFileSync(path.join(__dirname, "schema.sql"), "utf8")
  .replace(/\bkovak_automotores\b/g, `\`${DB}\``)
  .replace(/SET time_zone = '[^']*'/g, `SET time_zone = '${ZONA}'`);

(async () => {
  if (!ADMIN_USUARIO || ADMIN_PASSWORD.length < 8) {
    console.error("❌ Completá ADMIN_USUARIO y ADMIN_PASSWORD (mínimo 8 caracteres) en el .env antes de instalar.");
    process.exit(1);
  }

  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || undefined,
    multipleStatements: true,
    charset: "utf8mb4",
  });

  try {
    console.log(`→ Creando estructura en "${DB}"…`);
    await conexion.query(esquema);

    console.log(`→ Creando el usuario admin (${ADMIN_USUARIO})…`);
    await conexion.query("INSERT INTO usuarios (nombre, usuario, clave) VALUES (?, ?, ?)", [
      ADMIN_NOMBRE,
      ADMIN_USUARIO,
      await bcrypt.hash(ADMIN_PASSWORD, 10),
    ]);

    if (!sinUnidades) {
      console.log("→ Cargando el stock inicial…");
      for (const v of require("./datos-iniciales")) {
        const [r] = await conexion.query(
          `INSERT INTO vehiculos (slug, marca, modelo, anio, segmento, condicion, km, transmision, combustible, precio, descripcion, destacado, publicado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [v.slug, v.marca, v.modelo, v.anio, v.segmento, v.condicion, v.km, v.transmision, v.combustible, v.precio, v.descripcion, v.destacado ? 1 : 0]
        );
        for (const [orden, ruta] of v.imagenes.entries()) {
          await conexion.query("INSERT INTO vehiculo_imagenes (vehiculo_id, ruta, orden) VALUES (?, ?, ?)", [r.insertId, ruta, orden]);
        }
      }
    }

    const [tablas] = await conexion.query(
      `SELECT table_name AS tabla, table_rows AS filas FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name`,
      [DB]
    );
    console.table(tablas);
    console.log("✅ Base de datos lista. Entrá al panel en /admin con ADMIN_USUARIO y ADMIN_PASSWORD.");
  } catch (error) {
    console.error("❌ No se pudo instalar la base de datos:", error.message);
    process.exitCode = 1;
  } finally {
    await conexion.end();
  }
})();
