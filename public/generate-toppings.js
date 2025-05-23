// This file is a helper script to generate placeholder topping images
// In a real app, you would use actual images of the toppings
// To use: node generate-toppings.js

const fs = require('fs');
const path = require('path');

// Available toppings from our app
const toppings = [
  'pepperoni',
  'mushroom',
  'olive',
  'onion',
  'sausage',
  'bacon',
  'extra_cheese',
  'green_pepper',
  'pineapple'
];

// Function to generate a simple SVG for each topping
function generateToppingSVG(topping) {
  const colors = {
    pepperoni: '#c62828',
    mushroom: '#9e9e9e',
    olive: '#424242',
    onion: '#e0e0e0',
    sausage: '#795548',
    bacon: '#d84315',
    extra_cheese: '#fdd835',
    green_pepper: '#43a047',
    pineapple: '#ffc107'
  };
  
  const color = colors[topping] || '#9e9e9e';
  
  // Generate an SVG with circles representing the topping
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="transparent" />
    <text x="100" y="20" font-family="Arial" font-size="12" text-anchor="middle" fill="#666">${topping}</text>`;
    
  // Add 10-20 scattered elements for the topping
  const count = 10 + Math.floor(Math.random() * 10);
  
  for (let i = 0; i < count; i++) {
    const x = 20 + Math.random() * 160;
    const y = 30 + Math.random() * 150;
    const size = 5 + Math.random() * 15;
    
    if (topping === 'green_pepper' || topping === 'olive') {
      // Ring shape for olives and green peppers
      svg += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" />`;
      svg += `<circle cx="${x}" cy="${y}" r="${size * 0.6}" fill="#f5f5f5" />`;
    } else if (topping === 'pepperoni') {
      // Circle for pepperoni
      svg += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" />`;
    } else if (topping === 'mushroom') {
      // Mushroom cap
      svg += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" />`;
      svg += `<rect x="${x - size/2}" y="${y}" width="${size}" height="${size*0.7}" fill="#bdbdbd" />`;
    } else if (topping === 'pineapple') {
      // Pineapple chunks
      svg += `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" fill="${color}" />`;
    } else {
      // Random shapes for other toppings
      const shapeType = Math.random() > 0.5 ? 'circle' : 'rect';
      
      if (shapeType === 'circle') {
        svg += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" />`;
      } else {
        svg += `<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size * 1.5}" fill="${color}" />`;
      }
    }
  }
  
  svg += '</svg>';
  return svg;
}

// Make sure the img directory exists
const imgDir = path.join(__dirname, 'img');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// Create SVG files for each topping
toppings.forEach(topping => {
  const svgContent = generateToppingSVG(topping);
  fs.writeFileSync(path.join(imgDir, `topping-${topping}.svg`), svgContent);
  console.log(`Generated ${topping} SVG`);
});

console.log('All topping images generated in the img directory!');
console.log('In a production app, you would replace these with actual images.'); 