// Subida de las fotos de una unidad con multer (campo "fotos", varias a la vez).
// Guarda en public/img/vehiculos/subidas con nombres únicos; solo JPG, PNG o WEBP de hasta 5 MB c/u.
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { MAX_FOTOS } = require("../services/vehiculoService");

const TIPOS = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const MB = 5;

const subir = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "../../public/img/vehiculos/subidas"),
    filename: (req, file, cb) => cb(null, `auto-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${TIPOS[file.mimetype]}`),
  }),
  limits: { fileSize: MB * 1024 * 1024, files: MAX_FOTOS },
  fileFilter: (req, file, cb) => {
    if (TIPOS[file.mimetype]) return cb(null, true);
    const error = new Error("tipo");
    error.code = "TIPO_INVALIDO";
    cb(error);
  },
}).array("fotos", MAX_FOTOS);

const MENSAJES = {
  LIMIT_FILE_SIZE: `Cada foto puede pesar hasta ${MB} MB`,
  LIMIT_FILE_COUNT: `Podés subir hasta ${MAX_FOTOS} fotos`,
  LIMIT_UNEXPECTED_FILE: `Podés subir hasta ${MAX_FOTOS} fotos`,
  TIPO_INVALIDO: "Las fotos tienen que ser JPG, PNG o WEBP",
};

// Envuelve multer para que un error de archivo se muestre como error del formulario
module.exports = (req, res, next) => {
  subir(req, res, (err) => {
    if (err) req.errorFotos = MENSAJES[err.code] || "No se pudieron subir las fotos";
    req.files = req.files || [];
    next();
  });
};
