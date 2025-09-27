const { execSync } = require('child_process');

function lintPython(filePath) {
  try {
    const output = execSync(`flake8 ${filePath}`, { encoding: 'utf-8' });
    return { success: true, output };
  } catch (err) {
    return { success: false, output: err.stdout || err.message };
  }
}

module.exports = { lintPython };
