const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

function parseJS(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const ast = parser.parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

  let classes = [];
  let functions = [];
  let calls = [];

  traverse(ast, {
    FunctionDeclaration(path) { functions.push(path.node.id.name); },
    ClassDeclaration(path) { classes.push(path.node.id.name); },
    CallExpression(path) {
      if (path.node.callee.name) calls.push(path.node.callee.name);
    }
  });

  return { file: filePath.split('/').pop(), classes, functions, calls };
}

module.exports = { parseJS };
