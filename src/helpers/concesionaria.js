// Datos de la concesionaria: se usan en el header, el pie, los botones de WhatsApp y el SEO
const whatsappNumero = "5493815550192";

module.exports = {
  nombre: "Kovak Automotores",
  direccion: "Av. Belgrano 2450, San Miguel de Tucumán",
  mapa: "https://maps.google.com/?q=Av.+Belgrano+2450,+San+Miguel+de+Tucum%C3%A1n",
  ciudad: "San Miguel de Tucumán, Argentina",
  horarios: "Lun a Vie de 9:00 a 13:00 y 17:00 a 20:30 hs.",
  telefono: "381 555-0192",
  instagram: "https://instagram.com",
  whatsappNumero,
  // Arma el link de WhatsApp con un mensaje ya escrito
  whatsapp: (mensaje = "Hola Kovak Automotores! Quiero consultar con un asesor.") =>
    `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensaje)}`,
};
