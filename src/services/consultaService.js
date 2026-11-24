// Consultas del modal "Consultar con asesor"
const db = require("../model/database/models");

module.exports = {
  // vehiculoId llega cuando la consulta se hizo desde una unidad
  async crear({ nombre, telefono, motivo, mensaje, vehiculoId }) {
    const id = Number(vehiculoId) || null;
    const existe = id ? await db.Vehiculo.count({ where: { id } }) : 0;
    return db.Consulta.create({ nombre, telefono, motivo, mensaje: mensaje || null, vehiculoId: existe ? id : null });
  },

  async listar({ estado = "" } = {}) {
    const where = estado === "nuevas" ? { leida: false } : estado === "leidas" ? { leida: true } : {};
    return db.Consulta.findAll({
      where,
      include: [{ model: db.Vehiculo, as: "vehiculo", attributes: ["id", "slug", "marca", "modelo", "anio", "publicado"] }],
      order: [["leida", "ASC"], ["creado_en", "DESC"]],
      limit: 300,
    });
  },

  async ultimas(cantidad = 5) {
    return db.Consulta.findAll({
      include: [{ model: db.Vehiculo, as: "vehiculo", attributes: ["id", "slug", "marca", "modelo", "anio"] }],
      order: [["creado_en", "DESC"]],
      limit: cantidad,
    });
  },

  nuevas: () => db.Consulta.count({ where: { leida: false } }),

  async marcar(id, leida) {
    const c = await db.Consulta.findByPk(id);
    if (!c) return null;
    await c.update({ leida });
    return c;
  },

  eliminar: (id) => db.Consulta.destroy({ where: { id } }),
};
