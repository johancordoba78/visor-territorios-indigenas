// ================================
// MAPA BASE
// ================================
const map = L.map('map').setView([9.9, -84.2], 7);

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// ================================
// NORMALIZAR CLASIF
// ================================
function normalizarClasif(valor) {
  if (!valor) return "Sin CREF ni PAFTS";

  valor = valor.toString().toUpperCase().trim();

  if (valor === "CREF Y PAFTS") return "CREF y PAFTS";
  if (valor === "SOLO PAFTS") return "Solo PAFTS";
  if (valor === "SIN CREF NI PAFTS") return "Sin CREF ni PAFTS";

  return "Sin CREF ni PAFTS";
}

// ================================
// SIMBOLOGÍA
// ================================
function styleTerr(feature) {
  const clasif = normalizarClasif(feature.properties.CLASIF);

  if (clasif === "CREF y PAFTS") {
    return { color:'#4B1D6B', fillColor:'#4B1D6B', weight:1, fillOpacity:0.75 };
  }
  if (clasif === "Solo PAFTS") {
    return { color:'#9A6FB0', fillColor:'#9A6FB0', weight:1, fillOpacity:0.75 };
  }
  return { color:'#BDBDBD', fillColor:'#BDBDBD', weight:1, fillOpacity:0.6 };
}

// ================================
// CAPA GEOJSON
// ================================
let geojsonOriginal;

const capaTerr = L.geoJSON(null, {
  style: styleTerr,
  onEachFeature: function (feature, layer) {
    const nombre = feature.properties.TERRITORIO || "Sin nombre";
    const clasif = normalizarClasif(feature.properties.CLASIF);

    layer.bindPopup(
      `<b>Territorio:</b> ${nombre}<br>
       <b>Estado:</b> ${clasif}`
    );

    layer.on('click', () => map.fitBounds(layer.getBounds()));
  }
}).addTo(map);

// ================================
// CARGA DE DATOS (ESTE ERA EL PASO QUE FALTABA)
// ================================
fetch('./data/territorios_wgs84.geojson')
  .then(r => {
    if (!r.ok) throw new Error("No se pudo cargar el GeoJSON");
    return r.json();
  })
  .then(d => {
    geojsonOriginal = d;
    actualizarMapa("Todos");
    map.fitBounds(capaTerr.getBounds());
  })
  .catch(err => {
    console.error(err);
    alert("Error cargando territorios. Revisar consola.");
  });

// ================================
// FILTRO
// ================================
function actualizarMapa(filtro) {
  capaTerr.clearLayers();

  geojsonOriginal.features.forEach(f => {
    const estado = normalizarClasif(f.properties.CLASIF);
    if (filtro === "Todos" || estado === filtro) {
      capaTerr.addData(f);
    }
  });
}

document.getElementById("filtroClasif").addEventListener("change", function () {
  actualizarMapa(this.value);
});
