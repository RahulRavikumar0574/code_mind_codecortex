const fs = require('fs');
const path = require('path');
// We need to modify the original parsers to return more structure,
// but for now, we'll simulate a more structured output here.

const { parseJS } = require('./parser/parseJS');
const { parsePython } = require('./parser/parsePython');

function getFileStructure(dir, basePath = '') {
    const items = fs.readdirSync(dir);
    const structure = [];
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
            structure.push({
                name: item,
                path: relativePath,
                type: 'directory',
                children: getFileStructure(itemPath, relativePath)
            });
        } else {
            structure.push({
                name: item,
                path: relativePath,
                type: 'file'
            });
        }
    }
    return structure;
}

async function main() {
    const tempRepoDir = process.argv[2];
    if (!tempRepoDir) {
        console.error('Usage: node run_parser.js <path_to_repo>');
        process.exit(1);
    }

    const allFiles = [];
    function collectFiles(dir) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                collectFiles(fullPath);
            } else {
                allFiles.push(fullPath);
            }
        }
    }

    collectFiles(tempRepoDir);

    const logicTree = [];
    for (const file of allFiles) {
        const extension = path.extname(file);
        let parsedData;
        try {
            if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
                parsedData = parseJS(file);
            } else if (extension === '.py') {
                parsedData = parsePython(file);
            }

            if (parsedData) {
                const fileNode = {
                    name: path.basename(file),
                    type: 'module',
                    children: []
                };

                if (parsedData.classes && parsedData.classes.length > 0) {
                    const classNodes = parsedData.classes.map(c => ({ name: c, type: 'class', children: [] }));
                    // In a real scenario, we'd map functions to classes. For now, add all funcs to first class.
                    const funcNodes = parsedData.functions.map(f => ({ name: f, type: 'function', children: [] }));
                    if (classNodes.length > 0) {
                        classNodes[0].children = funcNodes;
                        fileNode.children.push(...classNodes);
                    }
                } else if (parsedData.functions && parsedData.functions.length > 0) {
                    const funcNodes = parsedData.functions.map(f => ({
                        name: f,
                        type: 'function',
                        // A real parser would associate calls with functions.
                        // We'll simulate by adding all calls to the first function.
                        children: (parsedData.calls || []).map(c => ({ name: c, type: 'call' }))
                    }));
                    fileNode.children.push(...funcNodes);
                }
                logicTree.push(fileNode);
            }
        } catch (e) {
            // console.error(`Could not parse ${file}:`, e.message);
        }
    }

    const fileStructure = getFileStructure(tempRepoDir);

    console.log(JSON.stringify({ structure: fileStructure, logicTree: logicTree }, null, 2));
}

main();
