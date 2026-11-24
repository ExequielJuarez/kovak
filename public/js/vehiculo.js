/* VEHÍCULO — galería de fotos (flechas, miniaturas, deslizar y teclado) */
(function () {
  "use strict";
  const galeria = document.getElementById("galeria");
  const pista = document.getElementById("galeriaPista");
  if (!galeria || !pista) return;

  const total = Number(galeria.dataset.total) || 1;
  const contador = document.getElementById("galeriaContador");
  const miniaturas = galeria.querySelectorAll("[data-foto]");
  let actual = 0;

  const ir = (i) => {
    actual = (i + total) % total;
    pista.scrollTo({ left: actual * pista.clientWidth });
  };

  const marcar = () => {
    actual = Math.round(pista.scrollLeft / pista.clientWidth);
    if (contador) contador.textContent = `${actual + 1} / ${total}`;
    miniaturas.forEach((m, i) => m.classList.toggle("activa", i === actual));
  };

  let espera;
  pista.addEventListener("scroll", () => { clearTimeout(espera); espera = setTimeout(marcar, 60); }, { passive: true });
  galeria.querySelectorAll("[data-galeria]").forEach((b) => b.addEventListener("click", () => ir(actual + Number(b.dataset.galeria))));
  miniaturas.forEach((m) => m.addEventListener("click", () => ir(Number(m.dataset.foto))));
  document.addEventListener("keydown", (e) => {
    if (total < 2 || document.body.classList.contains("bloqueado") || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === "ArrowRight") ir(actual + 1);
    if (e.key === "ArrowLeft") ir(actual - 1);
  });
})();
