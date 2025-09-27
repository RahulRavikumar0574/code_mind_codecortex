========================
CodeCortex2 - Simplified Hackathon MVP
========================

Overview:
---------
CodeCortex2 is a local web-based code analysis platform designed to help developers:

- Understand the structure of a codebase
- Detect syntax errors and basic issues in multiple programming languages
- Get simple human-readable explanations of code files/functions
- See function-to-function and module-to-module call flow
- Suggest basic integration points for code snippets into existing folders/repos

Supported Languages:
--------------------
Python, Java, C, C++, JavaScript/TypeScript, HTML, CSS, Arduino (.ino), Ruby, Shell

Features:
---------
1. Folder Upload & Parsing
   - Upload entire folders or repos (ignores datasets, binaries, ML model weights)
   - Extract files, classes, functions, and dependencies
   - Build a logic tree: modules → classes → functions → calls

2. Multi-Language Linting & Syntax Checking
   - Detect syntax/type/style errors (no deep AI suggestions)
   - Supports Python, JS/TS, Java, C/C++, Arduino, HTML/CSS, Ruby, Shell

3. AI Code Explanation
   - Uses Ollama local LLM for simplified 1–3 sentence explanations per file/function

4. Call-Flow / Dependency Graph
   - Analyze which functions call which, including cross-file calls
   - Generate visualizations using Mermaid.js in the frontend

5. Snippet Integration Assistant
   - Upload a small code snippet
   - Backend suggests which file/function/class it could interact with

Tech Stack:
-----------
- Backend: Node.js + Express.js
- File Upload & ZIP Handling: express-fileupload, adm-zip
- Parsing/Analysis: Python AST, Babel parser, Regex
- Linting/Formatting: flake8, mypy, ESLint, Checkstyle, cppcheck, HTMLHint, stylelint, arduino-cli, rubocop, shellcheck
- Call-Flow Graphs & Logic Tree: Custom logic tree + Mermaid.js
- AI Explanations: Ollama local LLM
- Frontend: React + Next.js + Tailwind CSS
- HTTP Requests: Axios
- Deployment: Frontend on Vercel; Backend runs locally or optionally on server

Folder Structure:
-----------------
CodeCortex2/
├── backend/
│   ├── checker/          # Multi-language linting
│   ├── optimizer/        # Optional code formatting
│   ├── parser/           # Parsing logic tree + call-flow
│   ├── snippet/          # Snippet integration assistant
│   ├── ai/               # Simplified AI explanation
│   └── utils/            # File helpers
├── python_llm/           # Optional Ollama Flask server
├── index.js              # Main Express backend server
├── package.json
├── package-lock.json
└── test_repo/            # Sample repo for testing/demo

Setup Instructions:
-------------------
1. Clone the repo:
   git clone https://github.com/DarkFlame2205/Code_Mind.git
   cd CodeCortex2

2. Install backend dependencies:
   npm install

3. Run the backend server:
   node index.js
   Backend will start at http://localhost:3001

4. Frontend:
   - To be developed/deployed on Vercel by connecting to backend APIs

How to Use:
-----------
- Use Postman or any HTTP client to interact with the backend endpoints:

1. **Upload Folder**
   - POST http://localhost:3001/upload
   - Form-Data: key `files` (select multiple files or zipped repo)
   - Response: Parsed folder structure + logic tree

2. **Lint Code**
   - POST http://localhost:3001/lint
   - JSON body: { "files": ["temp_repo/app.py","temp_repo/main.js"] }
   - Response: Syntax/type/style error results

3. **Optimize Code**
   - POST http://localhost:3001/optimize
   - JSON body: { "files": ["temp_repo/app.py","temp_repo/main.js"] }
   - Response: Optimized/formatted code suggestions

4. **Snippet Integration**
   - POST http://localhost:3001/snippet
   - JSON body: { "snippet": "<code snippet>", "logicTree": <logic tree object> }
   - Response: Suggested integration points

5. **AI Explanation**
   - POST http://localhost:3001/explain
   - JSON body: { "code": "<code string>" }
   - Response: Simplified explanation from Ollama

Notes:
------
- The backend runs locally; the frontend can connect via HTTP requests.
- Do not include `node_modules/` or temporary folders in the repo. Users can run `npm install` to fetch dependencies.
- Ensure Ollama LLM is installed locally for AI explanations.


Frontend Developer Instructions:
--------------------------------
1. The frontend should be built using React + Next.js + Tailwind CSS.
2. Components to implement:
   - FileUploader.jsx → Upload folder/files to backend (/upload)
   - FileTree.jsx → Display folder/file structure returned from backend
   - LogicTree.jsx → Render logic tree from /upload response
   - ChatWindow.jsx → AI explanations via /explain
   - SnippetIntegration.jsx → Suggest integration points via /snippet
   - CallFlowGraph.jsx → Visualize function/module call-flow using Mermaid.js
3. API integration:
   - Use Axios or similar to call backend endpoints (localhost:3001)
   - Ensure proper error handling if files or code are missing
4. Deployment:
   - Connect frontend to backend APIs
   - Deploy on Vercel (backend can run locally or on a server)
5. Styling:
   - Use Tailwind CSS for responsive UI
   - Optional: Add visual indicators for linting errors, optimized code suggestions, and AI explanations

