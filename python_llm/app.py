import os
import tempfile
import shutil
import subprocess
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app) # This will enable CORS for all routes

@app.route('/upload', methods=['POST'])
def upload():
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    # Create a temporary directory to save uploaded files
    temp_dir = tempfile.mkdtemp(prefix='codemind_repo_')

    try:
        for file in files:
            # To handle nested directories, the frontend needs to send the relative path.
            # For now, we assume a flat structure or that the full path is in `file.filename`.
            file_path = os.path.join(temp_dir, file.filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            file.save(file_path)

        # Path to the Node.js parser script
        parser_script_path = os.path.join(os.path.dirname(__file__), 'run_parser.js')

        # Execute the parser script as a subprocess
        result = subprocess.run(
            ['node', parser_script_path, temp_dir],
            capture_output=True,
            text=True,
            check=True
        )

        # The script's stdout is the JSON we want
        parsed_data = json.loads(result.stdout)
        return jsonify(parsed_data)

    except subprocess.CalledProcessError as e:
        # This will catch errors from the Node.js script
        return jsonify({"error": "Failed to parse code", "details": e.stderr}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500
    finally:
        # Ensure the temporary directory is always cleaned up
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

@app.route('/lint', methods=['POST'])
def lint():
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files to lint"}), 400

    temp_dir = tempfile.mkdtemp(prefix='codemind_lint_')
    results = []

    try:
        for file in files:
            file_path = os.path.join(temp_dir, file.filename)
            file.save(file_path)

            result = {"file": file.filename, "success": False, "details": "Unsupported file type"}

            if file.filename.endswith('.py'):
                try:
                    lint_result = subprocess.run(
                        ['flake8', file_path],
                        capture_output=True, text=True, check=False
                    )
                    if lint_result.returncode == 0:
                        result['success'] = True
                        result['details'] = 'No issues found.'
                    else:
                        result['details'] = lint_result.stdout
                except FileNotFoundError:
                    result['details'] = 'flake8 not found. Please ensure it is installed.'
            
            results.append(result)

        return jsonify({"lintResults": results})

    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

@app.route('/optimize', methods=['POST'])
def optimize():
    data = request.get_json()
    code = data.get('code', '')
    file_name = data.get('fileName', 'temp.py')  # Assume python if not specified

    if not code:
        return jsonify({"error": "No code to optimize"}), 400

    result = {"fileName": file_name, "success": False, "optimizedCode": code, "message": "Unsupported file type"}

    if file_name.endswith('.py'):
        try:
            # Call black via the current Python interpreter to avoid PATH issues on Windows
            # Reads from stdin ("-") and writes the formatted code to stdout
            process = subprocess.run(
                [os.environ.get('PYTHON_EXECUTABLE') or __import__('sys').executable, '-m', 'black', '-', '--fast', '--quiet'],
                input=code,
                capture_output=True,
                text=True,
                check=True
            )
            formatted = process.stdout or code  # some versions may write nothing if input already formatted
            result['success'] = True
            result['optimizedCode'] = formatted
            result['message'] = 'Code optimized successfully.'
        except FileNotFoundError:
            result['message'] = 'black not found via python -m black. Ensure it is installed in this venv (pip install black) and restart the backend.'
        except subprocess.CalledProcessError as e:
            # Black outputs errors to stderr
            result['message'] = f'Error during formatting: {e.stderr or e.stdout}'

    return jsonify(result)

@app.route('/snippet', methods=['POST'])
def snippet():
    data = request.get_json()
    snippet_code = data.get('snippet', '')
    logic_tree = data.get('logicTree', [])

    if not snippet_code or logic_tree is None:
        return jsonify({"error": "Missing snippet or logic tree"}), 400

    # Extract a function name from the snippet (similar to backend/snippet/integrateSnippet.js)
    func_name = None
    # JS/TS: function fname( or const fname = ( ...
    m = re.search(r"function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", snippet_code)
    if m:
        func_name = m.group(1)
    if not func_name:
        # Python: def fname(
        m = re.search(r"def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", snippet_code)
        if m:
            func_name = m.group(1)

    # Flatten hierarchical logicTree (module->class->function) into array of { file, functions }
    flat = []

    def collect(node, current_file=None, functions=None):
        if functions is None:
            functions = []
        ntype = node.get('type')
        name = node.get('name')
        if ntype == 'module':
            current_file = name
        elif ntype == 'function' and name:
            functions.append(name)
        # If leaf or we have children, continue
        for ch in node.get('children', []) or []:
            collect(ch, current_file, functions)
        # If we're at a module boundary, push
        if ntype == 'module':
            flat.append({
                'file': current_file or 'unknown',
                'functions': list(set(functions))
            })

    # logic_tree can be list of file modules
    if isinstance(logic_tree, list):
        for file_node in logic_tree:
            if isinstance(file_node, dict):
                collect(file_node)

    # Fallback: if already flat (JS parser style)
    if not flat and isinstance(logic_tree, list):
        for f in logic_tree:
            if isinstance(f, dict) and 'file' in f and 'functions' in f:
                flat.append({ 'file': f.get('file'), 'functions': f.get('functions') or [] })

    # Suggestion algorithm: if func_name is found in any file's functions, choose that file, else first file
    suggested_file = flat[0]['file'] if flat else None
    if func_name:
        for f in flat:
            if func_name in (f.get('functions') or []):
                suggested_file = f.get('file')
                break

    suggestions = []
    if suggested_file:
        suggestions.append({
            'file': suggested_file,
            'line': 1,
            'context': f"Detected function name: {func_name}" if func_name else "No specific function detected; suggesting first module.",
            'explanation': "Suggested based on function presence in module" if func_name else "Fallback to first module in logic tree",
            'codeSnippet': snippet_code
        })

    return jsonify({ 'suggestions': suggestions })

@app.route('/explain', methods=['POST'])
def explain():
    try:
        data = request.get_json()
        code = data.get('code', '')
        question = data.get('question', 'Explain this code snippet.')

        if not code:
            return jsonify({"error": "No code provided"}), 400

        # Mirror backend/ai/explain.js behavior: chat endpoint with messages
        ollama_host = os.environ.get('OLLAMA_HOST', 'http://localhost:11434')
        ollama_model = os.environ.get('OLLAMA_MODEL', 'gemma3:latest')

        payload = {
            'model': ollama_model,
            'messages': [
                {'role': 'system', 'content': 'Explain the given code simply in 1–3 sentences. Focus on what it does at a high level.'},
                {'role': 'user', 'content': f"{question}\n\n```\n{code}\n```"}
            ],
            'stream': False
        }

        response = requests.post(f"{ollama_host}/api/chat", json=payload, timeout=60)
        response.raise_for_status()
        data = response.json() or {}
        explanation = (
            (data.get('message') or {}).get('content')
            or (data.get('messages') or [{}])[0].get('content')
            or data.get('response')
            or 'Could not explain code'
        )
        return jsonify({'explanation': explanation})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Could not connect to Ollama service. Please ensure it is running.", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=3001, debug=True)
