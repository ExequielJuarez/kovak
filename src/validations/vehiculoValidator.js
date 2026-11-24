const { body } = require("express-validator");
const { LISTAS } = require("../services/vehiculoService");

const anioMax = new Date().getFullYear() + 1;
const sinPuntos = (v) => String(v ?? "").replace(/\D/g, "");

module.exports = [
  body("marca").trim().notEmpty().withMessage("Escribí la marca").bail().isLength({ max: 60 }).withMessage("Máximo 60 caracteres"),
  body("modelo").trim().notEmpty().withMessage("Escribí el modelo y la versión").bail().isLength({ max: 120 }).withMessage("Máximo 120 caracteres"),
  body("anio").customSanitizer(sinPuntos).isInt({ min: 1950, max: anioMax }).withMessage(`Año entre 1950 y ${anioMax}`),
  body("precio").customSanitizer(sinPuntos).isInt({ min: 1, max: 4000000000 }).withMessage("Poné el precio (solo números)"),
  body("km").customSanitizer(sinPuntos).optional({ values: "falsy" }).isInt({ min: 0, max: 2000000 }).withMessage("Kilómetros inválidos"),
  body("segmento").isIn(LISTAS.segmentos).withMessage("Elegí el tipo"),
  body("condicion").isIn(LISTAS.condiciones).withMessage("Elegí la condición"),
  body("transmision").isIn(LISTAS.transmisiones).withMessage("Elegí la transmisión"),
  body("combustible").isIn(LISTAS.combustibles).withMessage("Elegí el combustible"),
  body("descripcion").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).withMessage("Máximo 2000 caracteres"),
];
