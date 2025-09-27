function integrateSnippet(snippetCode, repoLogicTree) {
  const lines = snippetCode.split('\n');
  const funcLine = lines.find(l => l.match(/def |function /));
  const funcName = funcLine ? funcLine.match(/\w+/)[0] : null;

  let suggestedFile = repoLogicTree[0]?.file || null;

  if (funcName) {
    for (const f of repoLogicTree) {
      if (f.functions.includes(funcName)) {
        suggestedFile = f.file;
        break;
      }
    }
  }

  return { suggestedFile, suggestedFunction: funcName };
}

module.exports = { integrateSnippet };
