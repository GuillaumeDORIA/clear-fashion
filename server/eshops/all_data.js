const fs = require('fs');

// Read JSON files
const dedicatedProducts = JSON.parse(fs.readFileSync('dedicated_products.json', 'utf-8'));
const montlimartProducts = JSON.parse(fs.readFileSync('montlimart_products.json', 'utf-8'));
const csProducts = JSON.parse(fs.readFileSync('cs_products.json', 'utf-8'));

// Merge data
const allProducts = [...dedicatedProducts, ...montlimartProducts, ...csProducts];

// Write to a JSON file
const jsonData = JSON.stringify(allProducts);
fs.writeFileSync('all_products.json', jsonData, 'utf-8');
