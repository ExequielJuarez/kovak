/* ==========================================================
   KOVAK — comportamiento común a todas las páginas:
   menú del celular, modal "Consultar con asesor" y WhatsApp.
   ========================================================== */
(function () {
  "use strict";

  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

  // Bloquea el scroll de fondo mientras hay un panel abierto
  let abiertos = 0;
  const bloquear = (si) => {
    abiertos = Math.max(0, abiertos + (si ? 1 : -1));
    document.body.classList.toggle("bloqueado", abiertos > 0);
  };

  // Abre/cierra un panel con su fondo oscuro (lo usan el menú y los filtros)
  window.Kovak = window.Kovak || {};
  Kovak.panel = function (panel, fondo, boton) {
    let abierto = false;
    const cambiar = (abrir) => {
      if (abrir === abierto) return;
      abierto = abrir;
      bloquear(abrir);
      boton && boton.setAttribute("aria-expanded", String(abrir));
      panel.setAttribute("aria-hidden", String(!abrir));
      if (abrir) {
        fondo.hidden = false;
        requestAnimationFrame(() => { fondo.classList.add("visible"); panel.classList.add("abierto"); });
        const foco = panel.querySelector("button, a, input, select");
        foco && setTimeout(() => foco.focus({ preventScroll: true }), 50);
      } else {
        fondo.classList.remove("visible");
        panel.classList.remove("abierto");
        setTimeout(() => { if (!abierto) fondo.hidden = true; }, 300);
        boton && boton.focus({ preventScroll: true });
      }
    };
    fondo.addEventListener("click", () => cambiar(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cambiar(false); });
    return { abrir: () => cambiar(true), cerrar: () => cambiar(false), estaAbierto: () => abierto };
  };

  // ── Menú del celular ───────────────────────────────────
  const drawer = $("#drawer");
  if (drawer) {
    const menu = Kovak.panel(drawer, $("#drawerFondo"), $("#btnMenu"));
    $("#btnMenu").addEventListener("click", menu.abrir);
    $("#drawerCerrar").addEventListener("click", menu.cerrar);
    // Los links a una sección de la misma página cierran el menú
    $$("a", drawer).forEach((a) => a.addEventListener("click", menu.cerrar));
    matchMedia("(min-width: 1024px)").addEventListener("change", (e) => e.matches && menu.cerrar());
  }

  // ── Modal "Consultar con asesor" ───────────────────────
  const modal = $("#modalAsesor");
  const form = $("#formAsesor");
  const listo = $("#asesorListo");
  const NUMERO = "5493815550192";
  let ultimoFoco = null;

  const linkWhatsapp = (texto) => `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`;
  const mensajeWhatsapp = () => {
    const nombre = form.nombre.value.trim() || "un cliente";
    const motivo = form.motivo.value;
    const extra = form.mensaje.value.trim();
    return `Hola Kovak Automotores! Soy ${nombre}, quiero consultar con un asesor por: ${motivo}.${extra ? " " + extra : ""}`;
  };

  function abrirAsesor(motivo, vehiculoId = "") {
    ultimoFoco = document.activeElement;
    $("#asesorMotivo").textContent = motivo;
    form.motivo.value = motivo;
    form.vehiculoId.value = vehiculoId;
    form.hidden = false;
    listo.hidden = true;
    limpiarErrores();
    modal.hidden = false;
    bloquear(true);
    requestAnimationFrame(() => modal.classList.add("visible"));
    // En el celular no abrimos el teclado de una: se enfoca el botón de cerrar
    setTimeout(() => (matchMedia("(pointer: fine)").matches ? form.nombre : $("[data-cerrar]", modal)).focus({ preventScroll: true }), 80);
  }

  function cerrarAsesor() {
    if (modal.hidden) return;
    modal.classList.remove("visible");
    bloquear(false);
    setTimeout(() => { modal.hidden = true; }, 200);
    ultimoFoco && ultimoFoco.focus && ultimoFoco.focus({ preventScroll: true });
  }

  function limpiarErrores() {
    $$(".campo", form).forEach((c) => c.classList.remove("con-error"));
    $$("[data-error]", form).forEach((e) => (e.textContent = ""));
  }

  function mostrarErrores(errores) {
    Object.entries(errores).forEach(([campo, { msg }]) => {
      const caja = $(`[data-error="${campo}"]`, form);
      if (caja) { caja.textContent = msg; caja.closest(".campo").classList.add("con-error"); }
    });
    const primero = $(".con-error input", form);
    primero && primero.focus();
  }

  if (modal) {
    // Cualquier botón con data-asesor="motivo" abre el modal
    document.addEventListener("click", (e) => {
      const boton = e.target.closest("[data-asesor]");
      if (boton) { e.preventDefault(); abrirAsesor(boton.dataset.asesor, boton.dataset.vehiculo || ""); }
      if (e.target === modal || e.target.closest("[data-cerrar]")) cerrarAsesor();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarAsesor(); });

    $("#asesorWhatsapp").addEventListener("click", () => window.open(linkWhatsapp(mensajeWhatsapp()), "_blank", "noopener"));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      limpiarErrores();
      const boton = $("button[type=submit]", form);
      boton.disabled = true;
      try {
        const resp = await fetch(form.action, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const datos = await resp.json();
        if (!datos.ok) return mostrarErrores(datos.errores || {});
        $("#asesorListoWhatsapp").href = datos.whatsapp;
        const motivo = form.motivo.value, vehiculoId = form.vehiculoId.value;
        form.reset();
        form.motivo.value = motivo;
        form.vehiculoId.value = vehiculoId;
        form.hidden = true;
        listo.hidden = false;
      } catch (err) {
        // Sin conexión con el servidor: seguimos por WhatsApp igual
        window.open(linkWhatsapp(mensajeWhatsapp()), "_blank", "noopener");
      } finally {
        boton.disabled = false;
      }
    });
  }
})();
