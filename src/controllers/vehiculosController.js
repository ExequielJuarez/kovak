const vehiculoService = require("../services/vehiculoService");

module.exports = {
  // /vehiculos → listado con buscador, filtros y orden
  async listado(req, res) {
    const [{ lista, filtros, activos }, opciones] = await Promise.all([vehiculoService.filtrar(req.query), vehiculoService.opciones()]);
    res.render("vehiculos", {
      titulo: "Vehículos disponibles",
      descripcion: "Stock actualizado de Kovak Automotores: usados seleccionados y 0km multimarca en San Miguel de Tucumán.",
      estilo: "vehiculos",
      script: "vehiculos",
      navActivo: "vehiculos",
      vehiculos: lista,
      filtros,
      activos,
      opciones,
    });
  },

  // /vehiculo/:slug → ficha de la unidad
  async detalle(req, res, next) {
    const vehiculo = await vehiculoService.porSlug(req.params.slug);
    if (!vehiculo) return next();
    res.render("vehiculo", {
      titulo: `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}`,
      descripcion: vehiculo.descripcion,
      imagenOg: vehiculo.imagenes[0],
      estilo: "vehiculo",
      script: "vehiculo",
      navActivo: "vehiculos",
      vehiculo,
      relacionados: await vehiculoService.relacionados(vehiculo),
    });
  },
};
