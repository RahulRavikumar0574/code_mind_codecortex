const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const { saveFile, deleteFolderRecursive } = require('./backend/utils/fileUtils');

const { parsePython } = require('./backend/parser/parsePython');
const { parseJS } = require('./backend/parser/parseJS');
const { parseOther } = require('./backend/parser/parseOther');
const { buildLogicTree } = require('./backend/parser/logicTree');

const { lintPython } = require('./backend/checker/lintPython');
const { lintJS } = require('./backend/checker/lintJS');
const { lintOther } = require('./backend/checker/lintOther');

const { optimizePython } = require('./backend/optimizer/optimizePython');
const { optimizeJS } = require('./backend/optimizer/optimizeJS');
const { optimizeOther } = require('./backend/optimizer/optimizeOther');

const { integrateSnippet } = require('./backend/snippet/integrateSnippet');
const { explainCode } = require('./backend/ai/explain');

const app = express();

// Middleware
app.use(express.json());
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://codecortex-one.vercel.app',
    'https://lavera-unmodest-testingly.ngrok-free.dev',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}));

const TEMP_DIR = path.join(__dirname, 'temp_repo');

// ------------------------
// Upload & Parse Files
// ------------------------
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.files) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Clean temp folder
    if (fs.existsSync(TEMP_DIR)) deleteFolderRecursive(TEMP_DIR);
    fs.mkdirSync(TEMP_DIR);

    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const parsedFiles = [];

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file.name);
      await saveFile(file, filePath);

      const ext = path.extname(file.name).toLowerCase();
      let parsed;
      if (ext === '.py') parsed = parsePython(filePath);
      else if (ext === '.js' || ext === '.ts') parsed = parseJS(filePath);
      else parsed = parseOther(filePath);

      parsedFiles.push({ file: file.name, ...parsed });
    }

    const logicTree = buildLogicTree(parsedFiles);

    res.json({ structure: parsedFiles, logicTree });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing files' });
  }
});

// ------------------------
// Lint Files
// ------------------------
app.post('/lint', async (req, res) => {
  try {
    if (!req.files || !req.files.files) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const lintResults = [];

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file.name);
      await saveFile(file, filePath);

      const ext = path.extname(file.name).toLowerCase();
      let result;
      if (ext === '.py') result = lintPython(filePath);
      else if (ext === '.js' || ext === '.ts') result = lintJS(filePath);
      else result = lintOther(filePath);

      lintResults.push(result);
    }

    res.json({ lintResults });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error linting files' });
  }
});

// ------------------------
// Optimize Files
// ------------------------
app.post('/optimize', async (req, res) => {
  try {
    if (!req.files || !req.files.files) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const optimizeResults = [];

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file.name);
      await saveFile(file, filePath);

      const ext = path.extname(file.name).toLowerCase();
      let result;
      if (ext === '.py') result = optimizePython(filePath);
      else if (ext === '.js' || ext === '.ts') result = optimizeJS(filePath);
      else result = optimizeOther(filePath);

      optimizeResults.push(result);
    }

    res.json({ optimizeResults });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error optimizing files' });
  }
});

// ------------------------
// Snippet Integration
// ------------------------
app.post('/snippet', async (req, res) => {
  try {
    const { snippet, logicTree } = req.body;
    if (!snippet || !logicTree) return res.status(400).json({ error: 'Snippet or logicTree missing' });

    const suggestion = integrateSnippet(snippet, logicTree);
    res.json({ suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing snippet' });
  }
});

// ------------------------
// AI Explanation
// ------------------------
app.post('/explain', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code missing' });

    const explanation = await explainCode(code);
    res.json({ explanation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error explaining code' });
  }
});

// ------------------------
// Default route
// ------------------------
app.get('/', (req, res) => {
  res.send('CodeCortex2 Backend is running.');
});

// ------------------------
// Start server
// ------------------------
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
