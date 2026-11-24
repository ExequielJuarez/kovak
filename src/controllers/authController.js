// Login y logout del panel
const bcrypt = require("bcryptjs");
const db = require("../model/database/models");

// Solo deja volver a direcciones del panel (evita redirecciones a otros sitios)
const destino = (v) => (typeof v === "string" && /^\/admin(\/|$|\?)/.test(v) && !v.startsWith("/admin/login") ? v : "/admin");

// Freno simple a los intentos fallidos: 8 por IP cada 15 minutos
const intentos = new Map();
const VENTANA = 15 * 60 * 1000;
const bloqueado = (ip) => {
  const r = intentos.get(ip);
  if (!r || Date.now() - r.desde > VENTANA) return false;
  return r.n >= 8;
};
const fallo = (ip) => {
  const r = intentos.get(ip);
  if (!r || Date.now() - r.desde > VENTANA) intentos.set(ip, { n: 1, desde: Date.now() });
  else r.n++;
};

module.exports = {
  formulario(req, res) {
    if (req.session.admin) return res.redirect(destino(req.query.volver));
    res.render("admin/login", { titulo: "Ingresar al panel", volver: destino(req.query.volver), usuario: "", error: null });
  },

  async ingresar(req, res) {
    const nombreUsuario = String(req.body.usuario || "").trim().toLowerCase();
    const clave = String(req.body.clave || "");
    const volver = destino(req.body.volver);
    const mostrar = (error, status = 401) => res.status(status).render("admin/login", { titulo: "Ingresar al panel", volver, usuario: nombreUsuario, error });

    if (bloqueado(req.ip)) return mostrar("Demasiados intentos. Esperá unos minutos y probá de nuevo.", 429);
    if (!nombreUsuario || !clave) return mostrar("Completá el usuario y la contraseña.", 422);

    const usuario = await db.Usuario.findOne({ where: { usuario: nombreUsuario } });
    if (!usuario || !(await bcrypt.compare(clave, usuario.clave))) {
      fallo(req.ip);
      return mostrar("El usuario o la contraseña no son correctos.");
    }

    intentos.delete(req.ip);
    // Sesión nueva al entrar (evita reutilizar una sesión anterior)
    req.session.regenerate((err) => {
      if (err) return mostrar("No se pudo iniciar sesión. Probá de nuevo.", 500);
      req.session.admin = { id: usuario.id, nombre: usuario.nombre, usuario: usuario.usuario };
      req.session.save(() => res.redirect(volver));
    });
  },

  salir(req, res) {
    req.session.destroy(() => {
      res.clearCookie("kovak.sid");
      res.redirect("/admin/login");
    });
  },
};
