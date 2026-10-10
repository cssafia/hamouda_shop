
const fs = require('fs');
const path = require('path');

const FILE = path.resolve('storage/locations.json');
let cache = null;

function load() {
  if (cache) return cache;
  const raw = fs.readFileSync(FILE, 'utf8');
  const data = JSON.parse(raw);
  cache = {
    wilayas: data.wilayas || [],
    communes: data.communes || {},
  };
  return cache;
}

function listWilayas() {
  return load().wilayas;
}

function findWilaya(code) {
  return load().wilayas.find((w) => w.code === String(code)) || null;
}

function listCommunes(code) {
  return load().communes[String(code)] || [];
}

module.exports = { listWilayas, findWilaya, listCommunes };