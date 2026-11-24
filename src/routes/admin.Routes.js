const express = require("express");
const router = express.Router();

const soloAdmin = require("../middlewares/soloAdmin");
const subirFotos = require("../middlewares/subirFotos");
const vehiculoValidator = require("../validations/vehiculoValidator");
const auth = require("../controllers/authController");
const admin = require("../controllers/adminController");
const consultaService = require("../services/consultaService");

// ── Login (lo único del panel que se ve sin sesión) ────────
router.get("/login", auth.formulario);
router.post("/login", auth.ingresar);
router.post("/logout", auth.salir);

// Todo lo demás requiere un admin
router.use(soloAdmin);

// Número de consultas sin leer (se ve en el menú del panel)
router.use(async (req, res, next) => {
  res.locals.admin = req.session.admin;
  res.locals.consultasNuevas = await consultaService.nuevas();
  next();
});

router.get("/", admin.resumen);

// ── Unidades ───────────────────────────────────────────────
router.get("/vehiculos", admin.vehiculos);
router.get("/vehiculos/nuevo", admin.nuevo);
router.post("/vehiculos", subirFotos, vehiculoValidator, admin.crear);
router.get("/vehiculos/:id/editar", admin.editar);
router.put("/vehiculos/:id", subirFotos, vehiculoValidator, admin.actualizar);
router.delete("/vehiculos/:id", admin.eliminar);
// :campo es "publicado" o "destacado" (el servicio rechaza cualquier otro)
router.patch("/vehiculos/:id/:campo", admin.alternar);

// ── Consultas ──────────────────────────────────────────────
router.get("/consultas", admin.consultas);
router.patch("/consultas/:id", admin.marcarConsulta);
router.delete("/consultas/:id", admin.eliminarConsulta);

module.exports = router;
