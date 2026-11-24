const { body } = require("express-validator");

module.exports = [
  body("nombre").trim().notEmpty().withMessage("Escribí tu nombre").bail().isLength({ max: 80 }).withMessage("Nombre demasiado largo"),
  body("telefono")
    .trim()
    .notEmpty()
    .withMessage("Dejanos un teléfono")
    .bail()
    .matches(/^[0-9 +()-]{6,20}$/)
    .withMessage("Revisá el número (solo números, espacios o guiones)"),
  body("mensaje").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("El mensaje es muy largo"),
  body("motivo").trim().notEmpty().withMessage("Falta el motivo").bail().isLength({ max: 160 }),
  body("vehiculoId").optional({ values: "falsy" }).isInt({ min: 1 }).toInt(),
];
