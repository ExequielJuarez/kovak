/* INICIO — carrusel de destacados (flechas + deslizar con el dedo, que ya da el scroll nativo) */
(function () {
  "use strict";
  const carrusel = document.getElementById("carrusel");
  if (!carrusel) return;

  const flechas = document.querySelectorAll("[data-carrusel]");
  const paso = () => {
    const tarjeta = carrusel.querySelector(".destacado");
    const gap = parseFloat(getComputedStyle(carrusel).columnGap) || 16;
    return tarjeta ? tarjeta.offsetWidth + gap : carrusel.clientWidth * 0.85;
  };

  // Al llegar a un extremo, la flecha da la vuelta al otro lado
  flechas.forEach((b) =>
    b.addEventListener("click", () => {
      const dir = Number(b.dataset.carrusel);
      const max = carrusel.scrollWidth - carrusel.clientWidth - 2;
      if (dir > 0 && carrusel.scrollLeft >= max) return carrusel.scrollTo({ left: 0 });
      if (dir < 0 && carrusel.scrollLeft <= 2) return carrusel.scrollTo({ left: carrusel.scrollWidth });
      carrusel.scrollBy({ left: dir * paso() });
    })
  );

  // Flechas del teclado cuando el carrusel tiene el foco
  carrusel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      carrusel.scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * paso() });
    }
  });

  // Si entran todas las tarjetas, las flechas no hacen falta
  const revisar = () => {
    const sobra = carrusel.scrollWidth <= carrusel.clientWidth + 2;
    flechas.forEach((b) => (b.style.visibility = sobra ? "hidden" : ""));
  };
  revisar();
  addEventListener("resize", revisar, { passive: true });
})();
