const map = L.map('map').setView([9.9, -84.2], 7);

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');

function styleTerr(f){
  const c = f.properties.clasif;
  if(c==='CREF y PAFT') return {color:'#4B1D6B',fillColor:'#4B1D6B',weight:1,fillOpacity:.75};
  if(c==='Solo PAFT') return {color:'#9A6FB0',fillColor:'#9A6FB0',weight:1,fillOpacity:.75};
  return {color:'#BDBDBD',fillColor:'#BDBDBD',weight:1,fillOpacity:.6};
}

const capaTerr = L.geoJSON(null,{style:styleTerr,onEachFeature:(f,l)=>{
  l.bindPopup(`<b>Territorio:</b> ${f.properties.nombre}<br><b>Estado:</b> ${f.properties.clasif}`);
  l.on('click',()=>map.fitBounds(l.getBounds()));
}}).addTo(map);

fetch('data/territorios_wgs84.geojson').then(r=>r.json()).then(d=>{
  capaTerr.addData(d);
  map.fitBounds(capaTerr.getBounds());
});

L.control.layers({'OSM':osm,'Satélite':esri},{'Territorios indígenas':capaTerr}).addTo(map);

document.getElementById('exportMap').onclick=()=>{
  html2canvas(document.getElementById('map'),{useCORS:true}).then(c=>{
    const a=document.createElement('a');
    a.download='mapa_territorios.png';
    a.href=c.toDataURL();
    a.click();
  });
};
