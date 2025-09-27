function buildLogicTree(fileDataArray) {
  // Each fileData contains { file, classes, functions, calls }
  return fileDataArray.map(f => ({
    file: f.file,
    classes: f.classes,
    functions: f.functions,
    calls: f.calls
  }));
}

module.exports = { buildLogicTree };
