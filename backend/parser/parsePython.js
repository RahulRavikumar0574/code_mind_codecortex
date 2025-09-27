const fs = require('fs');
const { spawnSync } = require('child_process');

function parsePython(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const lines = code.split('\n');

  let classes = [];
  let functions = [];
  let calls = [];

  const classRegex = /^class (\w+)/;
  const funcRegex = /^def (\w+)/;
  const callRegex = /(\w+)\(/;

  lines.forEach(line => {
    line = line.trim();
    const classMatch = line.match(classRegex);
    if (classMatch) classes.push(classMatch[1]);
    const funcMatch = line.match(funcRegex);
    if (funcMatch) functions.push(funcMatch[1]);
    const callMatch = line.match(callRegex);
    if (callMatch && !functions.includes(callMatch[1]) && !classes.includes(callMatch[1])) calls.push(callMatch[1]);
  });

  return { file: filePath.split('/').pop(), classes, functions, calls };
}

module.exports = { parsePython };
