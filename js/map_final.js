// ================================
// MAPA BASE
// ================================

// Se crea el mapa y se define una vista inicial sobre Costa Rica
const map = L.map('map').setView([9.9, -84.2], 7);

// Capa base OpenStreetMap
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// ================================
// NORMALIZACIÓN DE CLASIFICACIÓN
// ================================

// Esta función estandariza los valores del atributo CLASIF
// para evitar problemas por mayúsculas, espacios o valores nulos
function normalizarClasif(valor) {
  if (!valor) return "Sin CREF ni PAFTS";

  valor = valor.toString().toUpperCase().trim();

  if (valor === "CREF Y PAFTS") return "CREF y PAFTS";
  if (valor === "SOLO PAFTS") return "Solo PAFTS";
  if (valor === "SIN CREF NI PAFTS") return "Sin CREF ni PAFTS";

  // Valor por defecto si no coincide con ningún caso esperado
  return "Sin CREF ni PAFTS";
}

// ================================
// SIMBOLOGÍA DE LOS TERRITORIOS
// ================================

// Define el estilo de cada polígono según su clasificación
function styleTerr(feature) {
  const clasif = normalizarClasif(feature.properties.CLASIF);

  if (clasif === "CREF y PAFTS") {
    return {
      color: '#4B1D6B',
      fillColor: '#4B1D6B',
      weight: 1,
      fillOpacity: 0.75
    };
  }

  if (clasif === "Solo PAFTS") {
    return {
      color: '#9A6FB0',
      fillColor: '#9A6FB0',
      weight: 1,
      fillOpacity: 0.75
    };
  }

  // Estilo por defecto
  return {
    color: '#BDBDBD',
    fillColor: '#BDBDBD',
    weight: 1,
    fillOpacity: 0.6
  };
}

// ================================
// CAPA GEOJSON (VACÍA AL INICIO)
// ================================

// Variable para almacenar el GeoJSON original completo
let geojsonOriginal;

// Se crea la capa GeoJSON sin datos inicialmente
const capaTerr = L.geoJSON(null, {
  style: styleTerr,

  onEachFeature: function (feature, layer) {
    const nombre = feature.properties.TERRITORIO || "Sin nombre";
    const clasif = normalizarClasif(feature.properties.CLASIF);

    // Popup informativo
    layer.bindPopup(
      `<b>Territorio:</b> ${nombre}<br>
       <b>Estado:</b> ${clasif}`
    );

    // Al hacer clic en un territorio, se ajusta el zoom a su extensión
    layer.on('click', () => map.fitBounds(layer.getBounds()));
  }

}).addTo(map);

// ================================
// CARGA DEL GEOJSON
// ================================

// Se carga el archivo GeoJSON desde GitHub Pages
fetch('./data/territorios_wgs84.geojson')
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo cargar el GeoJSON");
    }
    return response.json();
  })
  .then(data => {
    // Se guarda el GeoJSON completo en memoria
    geojsonOriginal = data;

    // Se cargan todos los territorios al inicio
    actualizarMapa("Todos");

    // Se ajusta la vista del mapa a la extensión de los territorios
    if (capaTerr.getLayers().length > 0) {
      map.fitBounds(capaTerr.getBounds());
    }
  })
  .catch(error => {
    console.error(error);
    alert("Error cargando territorios. Revisar consola.");
  });

// ================================
// FUNCIÓN DE FILTRADO
// ================================

// Actualiza la capa según el filtro seleccionado
function actualizarMapa(filtro) {
  capaTerr.clearLayers();

  geojsonOriginal.features.forEach(feature => {
    const estado = normalizarClasif(feature.properties.CLASIF);

    if (filtro === "Todos" || estado === filtro) {
      capaTerr.addData(feature);
    }
  });
}

// ================================
// EVENTO DEL SELECT (CORREGIDO)
// ================================

// IMPORTANTE:
// Este bloque está protegido para evitar que el visor se rompa
// si el elemento HTML no existe o aún no ha cargado

const filtroClasif = document.getElementById("filtroClasif");

if (filtroClasif) {
  filtroClasif.addEventListener("change", function () {
    actualizarMapa(this.value);
  });
}

// ================================
// FIN DEL SCRIPT
// ================================

