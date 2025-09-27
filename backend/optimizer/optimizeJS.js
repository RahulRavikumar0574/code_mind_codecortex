const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function optimizeJS(filePath) {
  const fileName = path.basename(filePath);
  
  try {
    // Read original file content and size
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');
    
    // Run Prettier for code formatting
    execSync(`prettier --write ${filePath}`);
    
    // Read optimized content and size
    const optimizedContent = fs.readFileSync(filePath, 'utf8');
    const optimizedSize = Buffer.byteLength(optimizedContent, 'utf8');
    
    return {
      file: fileName,
      success: true,
      optimizedCode: optimizedContent,
      originalSize,
      optimizedSize
    };
  } catch (err) {
    return {
      file: fileName,
      success: false,
      error: err.message
    };
  }
}

module.exports = { optimizeJS };
