const { validationResult } = require("express-validator");
const { whatsapp } = require("../helpers/concesionaria");
const consultaService = require("../services/consultaService");

module.exports = {
  // POST /consultas → formulario "Consultar con asesor".
  // Se guarda en la base (se ve en Admin → Consultas) y se devuelve el link de WhatsApp armado.
  async crear(req, res) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(422).json({ ok: false, errores: errores.mapped() });
    }
    const { nombre, telefono, mensaje, motivo, vehiculoId } = req.body;
    await consultaService.crear({ nombre, telefono, mensaje, motivo, vehiculoId });

    const texto = `Hola Kovak Automotores! Soy ${nombre}, quiero consultar con un asesor por: ${motivo}.${mensaje ? " " + mensaje : ""}`;
    res.json({ ok: true, whatsapp: whatsapp(texto) });
  },
};
