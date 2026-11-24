// Solo deja pasar si hay un admin con sesión iniciada; si no, lo manda al login (y después vuelve acá)
module.exports = (req, res, next) => {
  if (req.session.admin) return next();
  if (req.accepts(["html", "json"]) === "json") return res.status(401).json({ ok: false, mensaje: "Iniciá sesión de nuevo" });
  res.redirect(`/admin/login?volver=${encodeURIComponent(req.originalUrl)}`);
};
