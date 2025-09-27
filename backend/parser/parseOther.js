const fs = require('fs');

function parseOther(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  return { file: filePath.split('/').pop(), classes: [], functions: [], calls: [] };
}

module.exports = { parseOther };
