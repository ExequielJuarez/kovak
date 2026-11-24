/* VEHÍCULOS — panel de filtros en el celular y filtrado automático */
(function () {
  "use strict";
  const form = document.getElementById("formFiltros");
  const filtros = document.getElementById("filtros");
  if (!form || !filtros) return;

  const esPC = matchMedia("(min-width: 1024px)");
  const boton = document.getElementById("btnFiltros");
  const panel = Kovak.panel(filtros, document.getElementById("filtrosFondo"), boton);
  boton.addEventListener("click", panel.abrir);
  document.getElementById("filtrosCerrar").addEventListener("click", panel.cerrar);
  esPC.addEventListener("change", (e) => e.matches && panel.cerrar());

  // No mandar campos vacíos: la URL queda limpia (/vehiculos?marca=Toyota)
  form.addEventListener("formdata", (e) => {
    for (const [k, v] of [...e.formData.entries()]) {
      if (v === "" || (k === "orden" && v === "destacados")) e.formData.delete(k);
    }
  });
  const enviar = () => (form.requestSubmit ? form.requestSubmit() : form.submit());

  // El orden siempre se aplica al toque. Los demás selects solo en PC
  // (en el celular se eligen varios y se toca "Aplicar filtros").
  form.querySelectorAll("select[data-auto]").forEach((sel) =>
    sel.addEventListener("change", () => {
      if (sel.name === "orden" || esPC.matches) enviar();
    })
  );
})();
