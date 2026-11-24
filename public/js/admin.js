/* ==========================================================
   PANEL KOVAK — avisos, interruptores, confirmaciones y fotos
   ========================================================== */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ── Aviso flotante ─────────────────────────────────────
  const toast = $("#toast");
  let tiempo;
  function avisar(mensaje, error = false) {
    if (!toast) return;
    toast.textContent = mensaje;
    toast.classList.toggle("error", error);
    toast.classList.add("visible");
    clearTimeout(tiempo);
    tiempo = setTimeout(() => toast.classList.remove("visible"), 3200);
  }
  const flash = $("#flash");
  if (flash) avisar(flash.dataset.mensaje);

  // ── Confirmar antes de borrar ──────────────────────────
  document.addEventListener("submit", (e) => {
    const msg = e.target.dataset.confirmar;
    if (msg && !confirm(msg)) e.preventDefault();
  });

  // ── Interruptores Publicada / Destacada (sin recargar) ─
  $$("[data-alternar]").forEach((b) =>
    b.addEventListener("click", async () => {
      b.disabled = true;
      try {
        const r = await fetch(b.dataset.alternar, { method: "PATCH", headers: { Accept: "application/json" } });
        if (r.status === 401) return location.reload();
        const d = await r.json();
        if (!d.ok) throw new Error(d.mensaje);
        const valor = d[b.dataset.campo];
        b.setAttribute("aria-checked", String(valor));
        if (b.dataset.campo === "publicado") b.closest(".adm-fila")?.classList.toggle("adm-fila--oculta", !valor);
        avisar(b.dataset.campo === "publicado" ? (valor ? "Publicada en la web" : "Oculta de la web") : valor ? "Destacada en el inicio" : "Quitada de destacados");
      } catch (err) {
        avisar("No se pudo guardar. Probá de nuevo.", true);
      } finally {
        b.disabled = false;
      }
    })
  );

  // ── Cerrar el menú de usuario al tocar afuera ──────────
  const usuario = $(".adm-usuario");
  if (usuario) document.addEventListener("click", (e) => { if (!usuario.contains(e.target)) usuario.open = false; });

  // ── Formulario de unidad ───────────────────────────────
  const form = $("#formAuto");
  if (!form) return;

  // 0km → los kilómetros quedan en 0 y se oculta el campo
  const condicion = $("#condicion");
  const campoKm = $("#campoKm");
  const revisarKm = () => campoKm.classList.toggle("oculto", condicion.value === "0km");
  condicion.addEventListener("change", revisarKm);
  revisarKm();

  // Vista previa de las fotos elegidas (y arrastrar y soltar)
  const input = $("#inputFotos");
  const zona = $("#zonaFotos");
  const previas = $("#previas");
  const hayActuales = Boolean($(".fotos-actuales"));
  let urls = [];

  input.addEventListener("change", () => {
    urls.forEach(URL.revokeObjectURL);
    urls = [...input.files].map((f) => URL.createObjectURL(f));
    previas.innerHTML = urls
      .map((u, i) => `<li><img src="${u}" alt="Foto nueva ${i + 1}">${!hayActuales && i === 0 ? "<span>Portada</span>" : "<span>Nueva</span>"}</li>`)
      .join("");
  });
  ["dragenter", "dragover"].forEach((ev) => zona.addEventListener(ev, () => zona.classList.add("arrastrando")));
  ["dragleave", "drop"].forEach((ev) => zona.addEventListener(ev, () => zona.classList.remove("arrastrando")));

  // Si se marca para quitar la foto de portada, la portada pasa a la siguiente
  $$(".fotos-actuales li").forEach((li) => {
    const quitar = $("input[type=checkbox]", li);
    const portada = $("input[type=radio]", li);
    quitar.addEventListener("change", () => {
      if (quitar.checked && portada.checked) {
        const otra = $$(".fotos-actuales li").find((o) => !$("input[type=checkbox]", o).checked);
        if (otra) $("input[type=radio]", otra).checked = true;
      }
    });
    portada.addEventListener("change", () => { if (portada.checked) quitar.checked = false; });
  });

  // Evita mandar dos veces
  form.addEventListener("submit", () => {
    const b = $("button[type=submit]", form);
    setTimeout(() => { b.disabled = true; b.textContent = "Guardando…"; }, 0);
  });
})();
