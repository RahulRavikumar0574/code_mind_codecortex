const fs = require('fs');
const path = require('path');

async function saveFile(file, destPath) {
  return new Promise((resolve, reject) => {
    file.mv(destPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function deleteFolderRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

module.exports = { saveFile, deleteFolderRecursive };
