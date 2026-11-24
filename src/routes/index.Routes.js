const express = require("express");
const router = express.Router();

const inicioController = require("../controllers/inicioController");
const vehiculosController = require("../controllers/vehiculosController");
const consultaController = require("../controllers/consultaController");
const consultaValidator = require("../validations/consultaValidator");

// ── INICIO ─────────────────────────────────────────────────
router.get("/", inicioController.inicio);

// ── VEHÍCULOS ──────────────────────────────────────────────
router.get("/vehiculos", vehiculosController.listado);
router.get("/vehiculo/:slug", vehiculosController.detalle);

// ── CONSULTAS (modal "Consultar con asesor") ───────────────
router.post("/consultas", consultaValidator, consultaController.crear);

module.exports = router;
