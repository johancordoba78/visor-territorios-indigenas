// PRUEBA MINIMA PARA VER SI LEAFLET FUNCIONA

alert("MAP_FINAL.JS CARGADO");

const map = L.map('map').setView([9.9, -84.2], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

