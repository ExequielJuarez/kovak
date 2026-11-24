// Panel de administración: resumen, unidades y consultas
const { validationResult } = require("express-validator");
const vehiculoService = require("../services/vehiculoService");
const consultaService = require("../services/consultaService");

const { LISTAS, MAX_FOTOS } = vehiculoService;

// Valores vacíos para el formulario de "Nueva unidad"
const VACIO = {
  marca: "", modelo: "", anio: "", segmento: "", condicion: "Usado Seleccionado", km: "",
  transmision: "", combustible: "", precio: "", descripcion: "", destacado: false, publicado: true, fotos: [],
};

const avisar = (req, mensaje) => (req.session.flash = mensaje);

// Si el formulario vuelve con errores, las fotos recién subidas no se guardan
const descartarSubidas = (req) => Promise.all((req.files || []).map((f) => vehiculoService.borrarArchivo(`/img/vehiculos/subidas/${f.filename}`)));

function verFormulario(res, { vehiculo, errores = {}, status = 200 }) {
  res.status(status).render("admin/vehiculo-form", {
    titulo: vehiculo.id ? `Editar ${vehiculo.marca} ${vehiculo.modelo}` : "Nueva unidad",
    seccion: "vehiculos",
    vehiculo,
    errores,
    listas: LISTAS,
    maxFotos: MAX_FOTOS,
  });
}

// Junta los errores de validación + el de las fotos
function erroresDe(req, { fotosFinales }) {
  const errores = validationResult(req).mapped();
  if (req.errorFotos) errores.fotos = { msg: req.errorFotos };
  else if (fotosFinales < 1) errores.fotos = { msg: "Subí al menos una foto" };
  else if (fotosFinales > MAX_FOTOS) errores.fotos = { msg: `Máximo ${MAX_FOTOS} fotos por unidad` };
  return errores;
}

// Lo que se escribió en el formulario, para volver a mostrarlo si hay errores
const conDatosDelForm = (base, b) => ({
  ...base,
  ...b,
  destacado: b.destacado === "1",
  publicado: b.publicado === "1",
});

module.exports = {
  async resumen(req, res) {
    const [datos, ultimas, recientes] = await Promise.all([
      vehiculoService.resumen(),
      consultaService.ultimas(6),
      vehiculoService.listarAdmin(),
    ]);
    res.render("admin/resumen", { titulo: "Resumen", seccion: "resumen", datos, ultimas, recientes: recientes.slice(0, 5) });
  },

  // ── Unidades ───────────────────────────────────────────
  async vehiculos(req, res) {
    const q = String(req.query.q || "").trim().slice(0, 60);
    const estado = ["publicados", "ocultos", "destacados"].includes(req.query.estado) ? req.query.estado : "";
    const [lista, datos] = await Promise.all([vehiculoService.listarAdmin({ q, estado }), vehiculoService.resumen()]);
    res.render("admin/vehiculos", { titulo: "Unidades", seccion: "vehiculos", lista, datos, q, estado });
  },

  nuevo(req, res) {
    verFormulario(res, { vehiculo: { ...VACIO } });
  },

  async crear(req, res) {
    const errores = erroresDe(req, { fotosFinales: req.files.length });
    if (Object.keys(errores).length) {
      await descartarSubidas(req);
      return verFormulario(res, { vehiculo: conDatosDelForm(VACIO, req.body), errores, status: 422 });
    }
    const v = await vehiculoService.crear(req.body, req.files);
    avisar(req, `Se publicó ${v.marca} ${v.modelo}.`);
    res.redirect("/admin/vehiculos");
  },

  async editar(req, res, next) {
    const vehiculo = await vehiculoService.porId(req.params.id);
    if (!vehiculo) return next();
    verFormulario(res, { vehiculo });
  },

  async actualizar(req, res, next) {
    const actual = await vehiculoService.porId(req.params.id);
    if (!actual) {
      await descartarSubidas(req);
      return next();
    }
    const borrar = [].concat(req.body.borrarFotos || []).map(Number);
    const quedan = actual.fotos.filter((f) => !borrar.includes(f.id)).length;
    const errores = erroresDe(req, { fotosFinales: quedan + req.files.length });
    if (Object.keys(errores).length) {
      await descartarSubidas(req);
      return verFormulario(res, { vehiculo: { ...conDatosDelForm(actual, req.body), id: actual.id, fotos: actual.fotos }, errores, status: 422 });
    }
    const v = await vehiculoService.actualizar(actual.id, req.body, req.files);
    avisar(req, `Se guardaron los cambios de ${v.marca} ${v.modelo}.`);
    res.redirect("/admin/vehiculos");
  },

  async eliminar(req, res) {
    const ok = await vehiculoService.eliminar(req.params.id);
    avisar(req, ok ? "La unidad se eliminó." : "Esa unidad ya no existe.");
    res.redirect("/admin/vehiculos");
  },

  // PATCH /admin/vehiculos/:id/publicado o /destacado (desde la lista, sin recargar)
  async alternar(req, res) {
    const v = await vehiculoService.alternar(req.params.id, req.params.campo);
    if (!v) return res.status(404).json({ ok: false, mensaje: "No se encontró la unidad" });
    res.json({ ok: true, publicado: v.publicado, destacado: v.destacado });
  },

  // ── Consultas ──────────────────────────────────────────
  async consultas(req, res) {
    const estado = ["nuevas", "leidas"].includes(req.query.estado) ? req.query.estado : "";
    res.render("admin/consultas", { titulo: "Consultas", seccion: "consultas", lista: await consultaService.listar({ estado }), estado });
  },

  async marcarConsulta(req, res) {
    const c = await consultaService.marcar(req.params.id, req.body.leida !== "0" && req.body.leida !== false);
    if (req.accepts(["html", "json"]) === "json") return res.json({ ok: Boolean(c), leida: c?.leida });
    res.redirect("/admin/consultas");
  },

  async eliminarConsulta(req, res) {
    await consultaService.eliminar(req.params.id);
    avisar(req, "La consulta se eliminó.");
    res.redirect("/admin/consultas");
  },
};
