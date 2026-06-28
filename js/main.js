/* ============================================================
   main.js — Interacciones de la página (vanilla ES6+)
   · Tema claro/oscuro con persistencia
   · Menú mobile (hamburguesa)
   · Año dinámico en el pie
   · Mapa del recorrido (Leaflet) con datos oficiales
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     1. Tema claro / oscuro
     Toggla la clase .oscuro en <html> y la guarda en localStorage.
     -------------------------------------------------------- */
  const GestorTema = (() => {
    const CLAVE = 'linea44-tema';
    const raiz = document.documentElement;

    function aplicar(tema) {
      raiz.classList.toggle('oscuro', tema === 'oscuro');
      actualizarIcono(tema);
    }

    function actualizarIcono(tema) {
      const icono = document.getElementById('tema-icono');
      if (!icono) return;
      // En modo claro mostramos la luna (para ir a oscuro) y viceversa.
      const oscuro = tema === 'oscuro';
      icono.classList.toggle('icono--sol', oscuro);
      icono.classList.toggle('icono--luna', !oscuro);
    }

    function actual() {
      return raiz.classList.contains('oscuro') ? 'oscuro' : 'claro';
    }

    function iniciar() {
      const guardado = localStorage.getItem(CLAVE);
      aplicar(guardado === 'oscuro' ? 'oscuro' : 'claro'); // por defecto: claro

      const boton = document.getElementById('boton-tema');
      if (boton) {
        boton.addEventListener('click', () => {
          const siguiente = actual() === 'oscuro' ? 'claro' : 'oscuro';
          aplicar(siguiente);
          localStorage.setItem(CLAVE, siguiente);
        });
      }
    }

    return { iniciar };
  })();

  /* --------------------------------------------------------
     2. Menú mobile
     -------------------------------------------------------- */
  const MenuMovil = (() => {
    function iniciar() {
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

      boton.addEventListener('click', () => {
        definirAbierto(!menu.classList.contains('esta-abierto'));
      });

      // Cerrar al hacer click en cualquier enlace del menú.
      menu.querySelectorAll('a').forEach((enlace) => {
        enlace.addEventListener('click', () => definirAbierto(false));
      });

      // Cerrar si se pasa a viewport escritorio.
      const mq = window.matchMedia('(min-width: 1024px)');
      mq.addEventListener('change', (e) => {
        if (e.matches) definirAbierto(false);
      });
    }

    return { iniciar };
  })();

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
  const MapaRecorrido = (() => {
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

    function iniciar() {
      const el = document.getElementById('mapa-leaflet');
      if (!el || typeof L === 'undefined' || !window.RECORRIDO_LINEA44) return;

      // Íconos de marcador desde CDN (Leaflet no los resuelve solo).
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const mapa = L.map(el).setView([-34.6086, -58.44], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapa);

      const geojson = window.RECORRIDO_LINEA44;

      // Sentido VUELTA (debajo, punteado).
      L.geoJSON(geojson, {
        filter: (f) => f && f.properties && f.properties.sentido === 'VUELTA',
        style: () => ({
          color: '#d4a017',
          weight: 6,
          opacity: 0.75,
          dashArray: '10, 8',
          lineCap: 'round',
          lineJoin: 'round',
        }),
      }).addTo(mapa);

      // Sentido IDA (arriba, continuo).
      L.geoJSON(geojson, {
        filter: (f) => f && f.properties && f.properties.sentido === 'IDA',
        style: () => ({
          color: '#e8b923',
          weight: 6,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }),
      }).addTo(mapa);

      // Marcadores de las paradas principales.
      paradas.forEach((p) => {
        L.marker([p.lat, p.lng])
          .addTo(mapa)
          .bindPopup('<div class="popup-parada">' + p.nombre + '</div>');
      });
    }

    return { iniciar };
  })();

  /* --------------------------------------------------------
     Arranque
     -------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    GestorTema.iniciar();
    MenuMovil.iniciar();
    iniciarAnio();
    MapaRecorrido.iniciar();
  });
})();
