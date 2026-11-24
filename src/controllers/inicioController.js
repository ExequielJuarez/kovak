const vehiculoService = require("../services/vehiculoService");

module.exports = {
  async inicio(req, res) {
    const [{ lista }, destacados, opciones] = await Promise.all([
      vehiculoService.filtrar({ orden: "destacados" }),
      vehiculoService.destacados(),
      vehiculoService.opciones(),
    ]);
    res.render("inicio", {
      titulo: "Concesionaria Automotor",
      estilo: "inicio",
      script: "inicio",
      navActivo: "inicio",
      destacados,
      // En el inicio se muestra una vista previa del stock
      vistaPrevia: lista.slice(0, 6),
      totalStock: lista.length,
      opciones,
      clientes: require("../data/clientes"),
    });
  },
};
