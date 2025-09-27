const { execSync } = require('child_process');

function lintOther(filePath) {
  const ext = filePath.split('.').pop();
  try {
    let output = '';
    if (['c','cpp'].includes(ext)) output = execSync(`cppcheck ${filePath}`, { encoding: 'utf-8' });
    else if (ext === 'java') output = execSync(`java -jar checkstyle.jar ${filePath}`, { encoding: 'utf-8' });
    else if (['html','css'].includes(ext)) output = execSync(`htmlhint ${filePath}`, { encoding: 'utf-8' });
    else if (ext === 'ino') output = execSync(`arduino-cli compile ${filePath}`, { encoding: 'utf-8' });
    else if (ext === 'rb') output = execSync(`rubocop ${filePath}`, { encoding: 'utf-8' });
    else if (ext === 'sh') output = execSync(`shellcheck ${filePath}`, { encoding: 'utf-8' });
    return { success: true, output };
  } catch (err) {
    return { success: false, output: err.stdout || err.message };
  }
}

module.exports = { lintOther };
