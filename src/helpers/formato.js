// $ 46.900
const precio = (n) => "$ " + Number(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });

// 18.500 km
const km = (n) => Number(n).toLocaleString("es-AR") + " km";

// 24 nov 2026, 15:30
const fecha = (f) =>
  new Date(f).toLocaleString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" });

module.exports = { precio, km, fecha };
