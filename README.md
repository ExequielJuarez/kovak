# Kovak Automotores

Web y panel de administración de la concesionaria (San Miguel de Tucumán). Mismo stack y estructura
que **TopLevel**: Node + Express 5 + EJS + MySQL con Sequelize, con CSS y JS separados por página.

## Arrancar

1. Prendé MySQL (XAMPP → *Start* en MySQL, o el servicio MySQL Server).
2. Copiá `.env.example` como `.env` y completá `ADMIN_USUARIO`, `ADMIN_PASSWORD` y `SESSION_SECRET`.
3. Instalá y creá la base:

```bash
npm install
npm run db:instalar   # crea la base, el usuario admin y carga 8 unidades de ejemplo
npm run dev           # http://localhost:3000  ·  panel: http://localhost:3000/admin
npm run celular       # muestra la IP para abrirla desde el celular (mismo Wi-Fi)
```

`npm run db:instalar -- --vacia` crea todo sin las unidades de ejemplo.
`npm run db:admin` cambia el usuario y la clave del panel (los toma del `.env`) **sin borrar nada**.
**Ojo:** `db:instalar` borra y vuelve a crear las tablas.

## Web pública

| Ruta | Qué muestra |
|---|---|
| `/` | Portada, carrusel de destacados, buscador + vista previa del stock, banner "Tomamos tu usado" |
| `/vehiculos` | Listado con filtros (marca, tipo, año, precio), búsqueda y orden. Los filtros van en la URL: `/vehiculos?marca=Toyota&orden=precio-asc` |
| `/vehiculo/:slug` | Ficha: galería, datos, precio, WhatsApp, consultar con asesor, agendar visita y relacionados |
| `POST /consultas` | Formulario "Consultar con asesor": se guarda en la base y se ve en el panel |

## Panel (`/admin`)

- **Resumen**: unidades publicadas/ocultas, destacadas, consultas sin leer y valor del stock.
- **Unidades**: crear, editar y eliminar. Interruptores para **publicar/ocultar** (por ejemplo,
  cuando se vende) y **destacar** (carrusel del inicio). Hasta 12 fotos por unidad (JPG/PNG/WEBP,
  5 MB c/u): se elige cuál es la portada y se pueden quitar.
- **Consultas**: lo que llega desde la web, con botón directo a WhatsApp y al teléfono.

## Estructura

```
database/
  schema.sql                tablas (usuarios, vehiculos, vehiculo_imagenes, consultas)
  instalar.js               npm run db:instalar
  datos-iniciales.js        stock de ejemplo
src/
  app.js                    servidor Express (arranca solo si conecta con la base)
  routes/                   index.Routes.js (web) y admin.Routes.js (panel)
  controllers/              inicio, vehículos, consultas, auth (login) y admin
  services/                 vehiculoService (filtros, fotos, CRUD) y consultaService
  model/database/           config + modelos Sequelize
  middlewares/              soloAdmin (protege el panel) y subirFotos (multer)
  validations/              formulario de consulta y de unidades
  helpers/                  datos de la concesionaria, formato, íconos SVG, slug, red
  views/                    páginas, admin/ y partials/
public/
  css/  base.css (común) + una hoja por página + admin.css
  js/   base.js (común) + uno por página + admin.js
  img/vehiculos/            fotos del stock inicial · subidas/ = fotos cargadas desde el panel
```

## Datos de contacto

Teléfono de WhatsApp, dirección, horarios e Instagram: `src/helpers/concesionaria.js`
(y el número también en `public/js/base.js`, constante `NUMERO`).

## Responsive

Mobile first. Cortes: 640px (celular grande), 768px (tablet), 900px (panel: menú arriba),
1024px (PC: menú completo, filtros en columna) y 1240px (3 columnas en el listado).
