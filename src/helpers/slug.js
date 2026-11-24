// "Toyota Hilux SRX 2.8 TDI 4x4 2024" → "toyota-hilux-srx-2-8-tdi-4x4-2024"
const slug = (texto) =>
  String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);

module.exports = { slug };
