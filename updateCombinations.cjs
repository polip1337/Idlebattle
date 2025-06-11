const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'Data', 'evolutions.json');

function parseCombination(str) {
  // Split by arrows and pluses, trim whitespace, and filter out empty
  return str.split(/[→+]/).map(s => s.trim()).filter(Boolean).reduce((acc, curr) => {
    acc[curr] = true;
    return acc;
  }, {});
}

function updateCombinations(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(updateCombinations);
  } else if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key === 'combination' && typeof obj[key] === 'string') {
        obj[key] = parseCombination(obj[key]);
      } else {
        updateCombinations(obj[key]);
      }
    }
  }
}

// Read, update, and write back
ds = fs.readFileSync(filePath, 'utf8');
let data = JSON.parse(ds);
updateCombinations(data);
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log('Combinations updated!'); 