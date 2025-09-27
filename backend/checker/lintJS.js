const { execSync } = require('child_process');

function lintJS(filePath) {
  try {
    const output = execSync(`eslint ${filePath} -f json`, { encoding: 'utf-8' });
    return { success: true, output: JSON.parse(output) };
  } catch (err) {
    return { success: false, output: err.stdout || err.message };
  }
}

module.exports = { lintJS };
