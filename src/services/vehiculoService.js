// Todo lo que tiene que ver con las unidades: lo usan la web pública y el panel.
const fs = require("fs/promises");
const path = require("path");
const { Op } = require("sequelize");
const db = require("../model/database/models");
const { slug: aSlug } = require("../helpers/slug");

const MAX_FOTOS = 12;
const CARPETA_PUBLIC = path.join(__dirname, "../../public");
const conFotos = { model: db.VehiculoImagen, as: "fotos", attributes: ["id", "ruta", "orden"] };
const ordenFotos = [{ model: db.VehiculoImagen, as: "fotos" }, "orden", "ASC"];

const numero = (v) => {
  const n = parseInt(String(v ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

// Objeto simple para las vistas: igual que antes, con "imagenes" (rutas en orden)
const aVista = (v) => {
  if (!v) return null;
  const o = v.get({ plain: true });
  o.fotos = (o.fotos || []).sort((a, b) => a.orden - b.orden || a.id - b.id);
  o.imagenes = o.fotos.length ? o.fotos.map((f) => f.ruta) : ["/img/sin-foto.svg"];
  return o;
};

const ORDENES = {
  destacados: [["destacado", "DESC"], ["actualizado_en", "DESC"]],
  nuevos: [["anio", "DESC"], ["km", "ASC"]],
  "precio-asc": [["precio", "ASC"]],
  "precio-desc": [["precio", "DESC"]],
  "km-asc": [["km", "ASC"]],
};

// Valores fijos para los selects del panel
const LISTAS = {
  segmentos: ["Hatchback", "Sedán", "SUV", "Pick-up", "Utilitario", "Coupé", "Moto"],
  condiciones: ["0km", "Usado Seleccionado"],
  transmisiones: ["Manual", "Automática"],
  combustibles: ["Nafta", "Diésel", "Híbrido", "Eléctrico", "GNC"],
};

// Slug único: "toyota-hilux-srx-2024", y si ya existe "toyota-hilux-srx-2024-2"
async function slugUnico(datos, idActual = null) {
  const base = aSlug(`${datos.marca} ${datos.modelo} ${datos.anio}`) || "vehiculo";
  let slug = base;
  for (let i = 2; await db.Vehiculo.findOne({ where: { slug, ...(idActual ? { id: { [Op.ne]: idActual } } : {}) } }); i++) {
    slug = `${base}-${i}`;
  }
  return slug;
}

// Borra del disco solo las fotos subidas desde el panel (las del stock inicial no)
async function borrarArchivo(ruta) {
  if (!ruta || !ruta.startsWith("/img/vehiculos/subidas/")) return;
  await fs.unlink(path.join(CARPETA_PUBLIC, ruta)).catch(() => {});
}

// Datos del formulario del panel → columnas de la tabla
const desdeFormulario = (b) => ({
  marca: String(b.marca).trim(),
  modelo: String(b.modelo).trim(),
  anio: numero(b.anio),
  segmento: b.segmento,
  condicion: b.condicion,
  km: b.condicion === "0km" ? 0 : numero(b.km) || 0,
  transmision: b.transmision,
  combustible: b.combustible,
  precio: numero(b.precio),
  descripcion: String(b.descripcion || "").trim() || null,
  destacado: b.destacado === "1",
  publicado: b.publicado === "1",
});

module.exports = {
  MAX_FOTOS,
  LISTAS,

  // ── WEB PÚBLICA (solo unidades publicadas) ───────────────
  async destacados() {
    const lista = await db.Vehiculo.findAll({ where: { publicado: true, destacado: true }, include: [conFotos], order: [["actualizado_en", "DESC"], ordenFotos] });
    return lista.map(aVista);
  },

  async porSlug(slug) {
    return aVista(await db.Vehiculo.findOne({ where: { slug, publicado: true }, include: [conFotos], order: [ordenFotos] }));
  },

  // Marcas, tipos y años que hay en stock (para armar los filtros)
  async opciones() {
    const distintos = async (campo) =>
      (await db.Vehiculo.findAll({ attributes: [[db.sequelize.fn("DISTINCT", db.sequelize.col(campo)), campo]], where: { publicado: true }, raw: true })).map((r) => r[campo]);
    const [marcas, segmentos, anios] = await Promise.all([distintos("marca"), distintos("segmento"), distintos("anio")]);
    return {
      marcas: marcas.sort((a, b) => a.localeCompare(b, "es")),
      segmentos: segmentos.sort((a, b) => a.localeCompare(b, "es")),
      anios: anios.sort((a, b) => b - a),
      ordenes: [
        { valor: "destacados", texto: "Destacados" },
        { valor: "nuevos", texto: "Más nuevos primero" },
        { valor: "precio-asc", texto: "Menor precio" },
        { valor: "precio-desc", texto: "Mayor precio" },
        { valor: "km-asc", texto: "Menos kilómetros" },
      ],
    };
  },

  // Filtra con lo que llega en la URL: /vehiculos?q=hilux&marca=Toyota&precioMin=20000
  async filtrar(query = {}) {
    const f = {
      q: String(query.q || "").trim().slice(0, 60),
      marca: String(query.marca || ""),
      segmento: String(query.segmento || ""),
      precioMin: numero(query.precioMin),
      precioMax: numero(query.precioMax),
      anioMin: numero(query.anioMin),
      anioMax: numero(query.anioMax),
      orden: ORDENES[query.orden] ? query.orden : "destacados",
    };

    const where = { publicado: true };
    // La búsqueda no distingue tildes ni mayúsculas (collation utf8mb4_unicode_ci)
    if (f.q) {
      where[Op.and] = f.q.split(/\s+/).map((palabra) => ({
        [Op.or]: ["marca", "modelo", "segmento"].map((c) => ({ [c]: { [Op.like]: `%${palabra}%` } })).concat(numero(palabra) ? [{ anio: numero(palabra) }] : []),
      }));
    }
    if (f.marca) where.marca = f.marca;
    if (f.segmento) where.segmento = f.segmento;
    if (f.precioMin !== null || f.precioMax !== null) where.precio = { ...(f.precioMin !== null && { [Op.gte]: f.precioMin }), ...(f.precioMax !== null && { [Op.lte]: f.precioMax }) };
    if (f.anioMin !== null || f.anioMax !== null) where.anio = { ...(f.anioMin !== null && { [Op.gte]: f.anioMin }), ...(f.anioMax !== null && { [Op.lte]: f.anioMax }) };

    const lista = (await db.Vehiculo.findAll({ where, include: [conFotos], order: [...ORDENES[f.orden], ordenFotos] })).map(aVista);
    const activos = ["q", "marca", "segmento", "precioMin", "precioMax", "anioMin", "anioMax"].filter((k) => f[k] !== "" && f[k] !== null).length;
    return { lista, filtros: f, activos };
  },

  // Otras unidades para "También te puede interesar": primero las del mismo tipo y precio parecido
  async relacionados(vehiculo, cantidad = 3) {
    const otros = (await db.Vehiculo.findAll({ where: { publicado: true, id: { [Op.ne]: vehiculo.id } }, include: [conFotos], order: [ordenFotos] })).map(aVista);
    return otros
      .sort((a, b) => Number(b.segmento === vehiculo.segmento) - Number(a.segmento === vehiculo.segmento) || Math.abs(a.precio - vehiculo.precio) - Math.abs(b.precio - vehiculo.precio))
      .slice(0, cantidad);
  },

  // ── PANEL ────────────────────────────────────────────────
  async listarAdmin({ q = "", estado = "" } = {}) {
    const where = {};
    if (q) where[Op.or] = ["marca", "modelo"].map((c) => ({ [c]: { [Op.like]: `%${q}%` } }));
    if (estado === "publicados") where.publicado = true;
    if (estado === "ocultos") where.publicado = false;
    if (estado === "destacados") where.destacado = true;
    return (await db.Vehiculo.findAll({ where, include: [conFotos], order: [["actualizado_en", "DESC"], ordenFotos] })).map(aVista);
  },

  async porId(id) {
    return aVista(await db.Vehiculo.findByPk(id, { include: [conFotos], order: [ordenFotos] }));
  },

  async resumen() {
    const [total, publicados, destacados, consultasNuevas] = await Promise.all([
      db.Vehiculo.count(),
      db.Vehiculo.count({ where: { publicado: true } }),
      db.Vehiculo.count({ where: { publicado: true, destacado: true } }),
      db.Consulta.count({ where: { leida: false } }),
    ]);
    const valorStock = (await db.Vehiculo.sum("precio", { where: { publicado: true } })) || 0;
    return { total, publicados, ocultos: total - publicados, destacados, consultasNuevas, valorStock };
  },

  // Crea la unidad con las fotos subidas (la primera queda de portada)
  async crear(body, archivos = []) {
    return db.sequelize.transaction(async (transaction) => {
      const datos = desdeFormulario(body);
      datos.slug = await slugUnico(datos);
      const v = await db.Vehiculo.create(datos, { transaction });
      await db.VehiculoImagen.bulkCreate(
        archivos.map((a, i) => ({ vehiculoId: v.id, ruta: `/img/vehiculos/subidas/${a.filename}`, orden: i })),
        { transaction }
      );
      return v;
    });
  },

  // Actualiza datos y fotos: borra las marcadas, agrega las nuevas y respeta la portada elegida
  async actualizar(id, body, archivos = []) {
    const v = await db.Vehiculo.findByPk(id, { include: [conFotos] });
    if (!v) return null;

    const borrar = [].concat(body.borrarFotos || []).map(Number);
    const aBorrar = v.fotos.filter((f) => borrar.includes(f.id));

    await db.sequelize.transaction(async (transaction) => {
      const datos = desdeFormulario(body);
      if (datos.marca !== v.marca || datos.modelo !== v.modelo || datos.anio !== v.anio) datos.slug = await slugUnico(datos, v.id);
      await v.update(datos, { transaction });

      if (aBorrar.length) await db.VehiculoImagen.destroy({ where: { id: aBorrar.map((f) => f.id) }, transaction });
      const nuevas = await db.VehiculoImagen.bulkCreate(
        archivos.map((a) => ({ vehiculoId: v.id, ruta: `/img/vehiculos/subidas/${a.filename}`, orden: 999 })),
        { transaction }
      );

      // Reordena: la portada elegida primero, después el resto en el orden que tenían
      const portada = String(body.portada || "");
      const quedan = v.fotos.filter((f) => !borrar.includes(f.id)).sort((a, b) => a.orden - b.orden).concat(nuevas);
      quedan.sort((a, b) => Number(portada === `f${b.id}`) - Number(portada === `f${a.id}`));
      for (const [orden, foto] of quedan.entries()) await foto.update({ orden }, { transaction });
    });

    await Promise.all(aBorrar.map((f) => borrarArchivo(f.ruta)));
    return v;
  },

  async eliminar(id) {
    const v = await db.Vehiculo.findByPk(id, { include: [conFotos] });
    if (!v) return false;
    const rutas = v.fotos.map((f) => f.ruta);
    await v.destroy();
    await Promise.all(rutas.map(borrarArchivo));
    return true;
  },

  // Interruptores rápidos de la lista: publicado / destacado
  async alternar(id, campo) {
    if (!["publicado", "destacado"].includes(campo)) return null;
    const v = await db.Vehiculo.findByPk(id);
    if (!v) return null;
    await v.update({ [campo]: !v[campo] });
    return v;
  },

  borrarArchivo,
};
