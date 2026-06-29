'use strict';

/* --------------------------------------------------------
   1. Tema claro / oscuro
   Toggla la clase .oscuro en <html> y la guarda en localStorage.
   -------------------------------------------------------- */
const CLAVE_TEMA = 'linea44-tema';

function aplicarTema(tema) {
  document.documentElement.classList.toggle('oscuro', tema === 'oscuro');
  actualizarIconoTema(tema);
}

function actualizarIconoTema(tema) {
  const icono = document.getElementById('tema-icono');
  if (!icono) return;
  // En modo claro mostramos la luna (para ir a oscuro) y viceversa.
  const oscuro = tema === 'oscuro';
  icono.classList.toggle('icono--sol', oscuro);
  icono.classList.toggle('icono--luna', !oscuro);
}

function temaActual() {
  return document.documentElement.classList.contains('oscuro') ? 'oscuro' : 'claro';
}

function iniciarTema() {
  const guardado = localStorage.getItem(CLAVE_TEMA);
  aplicarTema(guardado === 'oscuro' ? 'oscuro' : 'claro'); // por defecto: claro

  const boton = document.getElementById('boton-tema');
  if (boton) {
    boton.addEventListener('click', function () {
      const siguiente = temaActual() === 'oscuro' ? 'claro' : 'oscuro';
      aplicarTema(siguiente);
      localStorage.setItem(CLAVE_TEMA, siguiente);
    });
  }
}

/* --------------------------------------------------------
   2. Menú mobile
   -------------------------------------------------------- */
function iniciarMenuMovil() {
  const boton = document.getElementById('boton-menu');
  const menu = document.getElementById('menu-movil');
  const iconoMenu = document.getElementById('menu-icono');
  if (!boton || !menu) return;

  function definirAbierto(abierto) {
    menu.classList.toggle('esta-abierto', abierto);
    boton.setAttribute('aria-expanded', String(abierto));
    if (iconoMenu) {
      iconoMenu.classList.toggle('icono--x', abierto);
      iconoMenu.classList.toggle('icono--menu', !abierto);
    }
  }

  boton.addEventListener('click', function () {
    definirAbierto(!menu.classList.contains('esta-abierto'));
  });

  // Cerrar al hacer click en cualquier enlace del menú.
  menu.querySelectorAll('a').forEach(function (enlace) {
    enlace.addEventListener('click', function () {
      definirAbierto(false);
    });
  });

  // Cerrar si se pasa a viewport escritorio.
  const mq = window.matchMedia('(min-width: 768px)');
  mq.addEventListener('change', function (e) {
    if (e.matches) definirAbierto(false);
  });
}

/* --------------------------------------------------------
   3. Año dinámico en el pie
   -------------------------------------------------------- */
function iniciarAnio() {
  const el = document.getElementById('anio-actual');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* --------------------------------------------------------
   4. Mapa del recorrido (Leaflet)
   -------------------------------------------------------- */
// Paradas principales de la Línea 44.
const paradas = [
  { lat: -34.657509, lng: -58.417826, nombre: 'Puente Alsina · Cabecera sur' },
  { lat: -34.654337, lng: -58.414795, nombre: 'Av. Sáenz / Pompeya' },
  { lat: -34.650064, lng: -58.425272, nombre: 'Av. Amancio Alcorta' },
  { lat: -34.642510, lng: -58.436258, nombre: 'Parque Patricios' },
  { lat: -34.631975, lng: -58.448596, nombre: 'Del Barco Centenera / Curapaligüe' },
  { lat: -34.618671, lng: -58.457222, nombre: 'Av. Rivadavia (Caballito)' },
  { lat: -34.604423, lng: -58.464153, nombre: 'Donato Álvarez' },
  { lat: -34.592750, lng: -58.464475, nombre: 'Av. Warnes (Villa Crespo)' },
  { lat: -34.587062, lng: -58.456246, nombre: 'Av. Federico Lacroze · Chacarita' },
  { lat: -34.580863, lng: -58.449991, nombre: 'Álvarez Thomas (Colegiales)' },
  { lat: -34.569104, lng: -58.457437, nombre: 'Belgrano (Amenábar)' },
  { lat: -34.559986, lng: -58.447797, nombre: 'Barrancas de Belgrano · Cabecera norte' },
];

function iniciarMapa() {
  const el = document.getElementById('mapa-leaflet');
  if (!el || typeof L === 'undefined' || !window.RECORRIDO_LINEA44) return;

  const mapa = L.map(el).setView([-34.6086, -58.44], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapa);

  const geojson = window.RECORRIDO_LINEA44;

  // Sentido VUELTA (debajo, punteado).
  L.geoJSON(geojson, {
    filter: function (f) {
      return f && f.properties && f.properties.sentido === 'VUELTA';
    },
    style: function () {
      return {
        color: '#d4a017',
        weight: 6,
        opacity: 0.75,
        dashArray: '10, 8',
        lineCap: 'round',
        lineJoin: 'round',
      };
    },
  }).addTo(mapa);

  // Sentido IDA (arriba, continuo).
  L.geoJSON(geojson, {
    filter: function (f) {
      return f && f.properties && f.properties.sentido === 'IDA';
    },
    style: function () {
      return {
        color: '#e8b923',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      };
    },
  }).addTo(mapa);

  // Marcadores de las paradas principales.
  paradas.forEach(function (p) {
    L.circleMarker([p.lat, p.lng], {
      radius: 7,
      color: '#ffffff',
      weight: 3,
      fillColor: '#ffc107',
      fillOpacity: 1,
    })
      .addTo(mapa)
      .bindPopup('<div class="popup-parada">' + p.nombre + '</div>');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  iniciarTema();
  iniciarMenuMovil();
  iniciarAnio();
  iniciarMapa();
});
