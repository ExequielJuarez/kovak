require("dotenv").config({ quiet: true });
const express = require("express");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");

const app = express();
const indexRouter = require("./routes/index.Routes");
const adminRouter = require("./routes/admin.Routes");
const db = require("./model/database/models");

// Render (y otros hostings) indican el puerto en PORT
const puerto = Number(process.env.PORT) || 3000;
// Por defecto escucha en todas las interfaces: así también se abre desde el celular
// (misma red Wi-Fi) con la IP de la compu. HOST=127.0.0.1 la deja solo para esta compu.
const host = process.env.HOST || "0.0.0.0";

app.use(express.static(path.join(__dirname, "../public")));
app.get("/favicon.ico", (req, res) => res.redirect(301, "/img/favicon.svg"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Formularios con PUT / DELETE / PATCH: action="...?_method=PUT"
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Detrás del proxy https del hosting: necesario para que la cookie segura funcione
app.set("trust proxy", 1);

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  console.warn("⚠️  Falta SESSION_SECRET en las variables de entorno: usá una clave larga y secreta.");
}

app.use(
  session({
    name: "kovak.sid",
    secret: process.env.SESSION_SECRET || "clave-solo-para-desarrollo-local",
    resave: false,
    saveUninitialized: false,
    // "auto": cookie segura cuando la página se sirve por https, normal en localhost
    cookie: { secure: "auto", httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 12 },
  })
);

// Helpers disponibles en todas las vistas
app.locals.concesionaria = require("./helpers/concesionaria");
app.locals.formatoPrecio = require("./helpers/formato").precio;
app.locals.formatoKm = require("./helpers/formato").km;
app.locals.formatoFecha = require("./helpers/formato").fecha;
app.locals.icono = require("./helpers/iconos");
// Texto del motivo de consulta para una unidad: "2024 Toyota Hilux SRX ($ 46.900)"
app.locals.motivoVehiculo = (v) => `${v.anio} ${v.marca} ${v.modelo} (${app.locals.formatoPrecio(v.precio)})`;

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  // Mensaje de un solo uso (se muestra como aviso y se borra)
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.use("/admin", adminRouter);
app.use("/", indexRouter);

// Página que no existe
app.use((req, res) => {
  if (req.accepts(["html", "json"]) === "json") return res.status(404).json({ ok: false, mensaje: "No encontrado" });
  res.status(404).render("error", {
    titulo: "Página no encontrada",
    estilo: "error",
    mensaje: "La página que buscás no existe o cambió de lugar.",
  });
});

// Error inesperado (por ejemplo, se cayó la base de datos)
app.use((err, req, res, next) => {
  console.error("❌", err);
  if (req.accepts(["html", "json"]) === "json") {
    return res.status(500).json({ ok: false, mensaje: "Error del servidor, probá de nuevo" });
  }
  res.status(500).render(
    "error",
    { titulo: "Algo salió mal", estilo: "error", mensaje: "Tuvimos un problema. Probá de nuevo en unos minutos.", codigo: 500 },
    (error, html) => res.send(error ? "<h1>Algo salió mal</h1><p>Probá de nuevo en unos minutos.</p>" : html)
  );
});

// Arranca solo si hay conexión con la base de datos
db.sequelize
  .authenticate()
  .then(() => {
    console.log(`✅ Conectado a la base de datos "${db.sequelize.config.database}"`);
    app.listen(puerto, host, () => {
      console.log(`🚗 Kovak Automotores corriendo en el puerto ${puerto}`);
      require("./helpers/red").avisoDeArranque(puerto, host).forEach((linea) => console.log(linea));
      console.log(`   🔐 Panel: http://localhost:${puerto}/admin`);
    });
  })
  .catch((error) => {
    console.error("❌ No se pudo conectar con la base de datos:", error.message);
    console.error("   Revisá DB_HOST, DB_USER, DB_PASSWORD y DB_NAME en el .env y que MySQL esté encendido.");
    console.error("   Para crear las tablas y cargar el stock inicial: npm run db:instalar");
    process.exit(1);
  });
