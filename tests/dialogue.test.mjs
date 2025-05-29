import { expect } from 'chai';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Mock browser environment
global.document = {
    getElementById: () => ({
        classList: {
            add: () => {},
            remove: () => {},
            contains: () => false
        },
        style: {},
        textContent: '',
        src: '',
        onclick: null,
        addEventListener: () => {},
        removeEventListener: () => {}
    })
};

// Mock window object
global.window = {
    battleStarted: false,
    isBattlePausedForDialogue: false,
    unlockMapPOI: () => {},
    hideMapPOI: () => {},
    startDialogue: () => {},
    removeCompanionFromParty: () => {}
};

// Mock hero object
global.hero = {
    addItemToInventory: () => {},
    hasItem: () => false,
    equipItem: () => true,
    recruitCompanion: () => {},
    getActivePartyMembers: () => []
};

// Mock quest system
global.questSystem = {
    startQuest: () => {},
    completeQuest: () => {},
    activeQuests: new Set(),
    quests: new Map(),
    updateQuestProgress: () => {}
};

// Mock allItemsCache
global.allItemsCache = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all NPC directories
const npcBaseDir = join(__dirname, '../Data/NPCs');
const npcDirs = readdirSync(npcBaseDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

// Valid action types from actionHandler.js
const validActionTypes = [
    'startQuest',
    'addItem',
    'removeItem',
    'equip',
    'completeQuest',
    'unlockPOI',
    'hidePOI',
    'travelToMap',
    'openDialogue',
    'startSlideshow',
    'startBattle',
    'addCompanion',
    'removeCompanion',

];

// Add HTML reporter class
class HTMLReporter {
    constructor() {
        this.results = {
            passed: [],
            failed: [],
            total: 0
        };
        this.dialogueData = new Map(); // Store dialogue data separately
    }

    addResult(test) {
        this.results.total++;
        if (test.state === 'passed') {
            this.results.passed.push({
                title: test.title,
                file: test.file || 'Unknown',
                duration: test.duration,
                dialoguePath: test.file || null // Store file path instead of dialogue data
            });
            if (test.dialogue) {
                this.dialogueData.set(test.file, test.dialogue);
            }
        } else {
            this.results.failed.push({
                title: test.title,
                file: test.file || 'Unknown',
                error: test.err?.message || 'Unknown error',
                duration: test.duration,
                dialoguePath: test.file || null // Store file path instead of dialogue data
            });
            if (test.dialogue) {
                this.dialogueData.set(test.file, test.dialogue);
            }
        }
    }

    async displayDialogue(dialoguePath) {
        const dialogue = this.dialogueData.get(dialoguePath);
        if (!dialogue) return;
        
        const dialogueModal = document.getElementById('dialogue-modal');
        const npcPortrait = document.getElementById('npc-portrait-img');
        const npcName = document.getElementById('npc-name');
        const dialogueText = document.getElementById('dialogue-text');
        const optionButtons = [
            document.getElementById('option-1'),
            document.getElementById('option-2'),
            document.getElementById('option-3'),
            document.getElementById('option-4'),
            document.getElementById('option-5'),
            document.getElementById('option-6'),
            document.getElementById('option-7'),
            document.getElementById('option-8')
        ];

        function displayNode(node) {
            if (!node) return;
            
            // Update dialogue text
            npcName.textContent = 'Test NPC';
            dialogueText.textContent = node.text;

            // Clear previous options
            optionButtons.forEach(button => {
                button.style.display = 'none';
                button.textContent = '';
                button.onclick = null;
            });

            // If no options, add click to close
            if (!node.options || node.options.length === 0) {
                dialogueModal.onclick = () => {
                    dialogueModal.classList.add('hidden');
                };
                return;
            }

            // Display options
            node.options.forEach((option, index) => {
                if (index < optionButtons.length) {
                    const button = optionButtons[index];
                    button.style.display = 'block';
                    button.textContent = option.text;
                    button.onclick = () => {
                        if (option.nextId) {
                            const nextNode = dialogue.nodes.find(n => n.id === option.nextId);
                            displayNode(nextNode);
                        } else {
                            dialogueModal.classList.add('hidden');
                        }
                    };
                }
            });
        }

        // Show dialogue modal
        dialogueModal.classList.remove('hidden');
        
        // Start with the start node
        const startNode = dialogue.nodes.find(node => node.id === 'start');
        displayNode(startNode);
    }

    generateReport() {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Dialogue Test Results</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .summary {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test-section {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test-item {
            padding: 10px;
            margin: 5px 0;
            border-radius: 3px;
        }
        .passed {
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
        }
        .failed {
            background-color: #ffebee;
            border-left: 4px solid #f44336;
        }
        .error-message {
            color: #d32f2f;
            margin-top: 5px;
            font-family: monospace;
            white-space: pre-wrap;
        }
        .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-box {
            background-color: white;
            padding: 15px;
            border-radius: 5px;
            flex: 1;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
        }
        .passed .stat-number { color: #4caf50; }
        .failed .stat-number { color: #f44336; }
        .total .stat-number { color: #2196f3; }
        .view-dialogue-btn {
            background-color: #2196f3;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            margin-top: 5px;
        }
        .view-dialogue-btn:hover {
            background-color: #1976d2;
        }
        .dialogue-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .dialogue-modal.hidden {
            display: none;
        }
        .dialogue-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 90%;
            position: relative;
        }
        .npc-portrait {
            text-align: center;
            margin-bottom: 15px;
        }
        .npc-portrait img {
            max-width: 200px;
            border-radius: 4px;
        }
        .dialogue-text {
            margin-bottom: 20px;
        }
        .dialogue-text p {
            margin: 5px 0;
        }
        #npc-name {
            font-weight: bold;
            font-size: 1.2em;
            color: #333;
        }
        #dialogue-text {
            line-height: 1.5;
            color: #444;
        }
        .dialogue-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .option-button {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            text-align: left;
            transition: background-color 0.2s;
        }
        .option-button:hover {
            background-color: #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Dialogue Test Results</h1>
        
        <div class="stats">
            <div class="stat-box total">
                <div>Total Tests</div>
                <div class="stat-number">${this.results.total}</div>
            </div>
            <div class="stat-box passed">
                <div>Passed</div>
                <div class="stat-number">${this.results.passed.length}</div>
            </div>
            <div class="stat-box failed">
                <div>Failed</div>
                <div class="stat-number">${this.results.failed.length}</div>
            </div>
        </div>

        ${this.results.failed.length > 0 ? `
        <div class="test-section">
            <h2>Failed Tests</h2>
            ${this.results.failed.map(test => `
                <div class="test-item failed">
                    <div><strong>${test.title}</strong></div>
                    <div>File: ${test.file}</div>
                    <div class="error-message">${test.error}</div>
                    ${test.dialoguePath ? `
                    <button class="view-dialogue-btn" onclick="window.displayDialogue('${test.dialoguePath}')">
                        View Dialogue
                    </button>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="test-section">
            <h2>Passed Tests</h2>
            ${this.results.passed.map(test => `
                <div class="test-item passed">
                    <div><strong>${test.title}</strong></div>
                    <div>File: ${test.file}</div>
                    ${test.dialoguePath ? `
                    <button class="view-dialogue-btn" onclick="window.displayDialogue('${test.dialoguePath}')">
                        View Dialogue
                    </button>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>

    <div class="dialogue-modal hidden" id="dialogue-modal">
        <div class="dialogue-content">
            <div class="npc-portrait">
                <img id="npc-portrait-img" src="Media/npc/img.png" alt="NPC Portrait">
            </div>
            <div class="dialogue-text">
                <p id="npc-name">NPC Name</p>
                <p id="dialogue-text">Dialogue text goes here.</p>
            </div>
            <div class="dialogue-options">
                <button class="option-button" id="option-1" style="display: none;">Option 1</button>
                <button class="option-button" id="option-2" style="display: none;">Option 2</button>
                <button class="option-button" id="option-3" style="display: none;">Option 3</button>
                <button class="option-button" id="option-4" style="display: none;">Option 4</button>
                <button class="option-button" id="option-5" style="display: none;">Option 5</button>
                <button class="option-button" id="option-6" style="display: none;">Option 6</button>
                <button class="option-button" id="option-7" style="display: none;">Option 7</button>
                <button class="option-button" id="option-8" style="display: none;">Option 8</button>
            </div>
        </div>
    </div>

    <script>
        // Store dialogue data
        window.dialogueData = ${JSON.stringify(Object.fromEntries(this.dialogueData))};
        
        // Define displayDialogue function
        window.displayDialogue = function(dialoguePath) {
            const dialogue = window.dialogueData[dialoguePath];
            if (!dialogue) return;
            
            const dialogueModal = document.getElementById('dialogue-modal');
            const npcPortrait = document.getElementById('npc-portrait-img');
            const npcName = document.getElementById('npc-name');
            const dialogueText = document.getElementById('dialogue-text');
            const optionButtons = [
                document.getElementById('option-1'),
                document.getElementById('option-2'),
                document.getElementById('option-3'),
                document.getElementById('option-4'),
                document.getElementById('option-5'),
                document.getElementById('option-6'),
                document.getElementById('option-7'),
                document.getElementById('option-8')
            ];

            function displayNode(node) {
                if (!node) return;
                
                // Update dialogue text
                npcName.textContent = 'Test NPC';
                dialogueText.textContent = node.text;

                // Clear previous options
                optionButtons.forEach(button => {
                    button.style.display = 'none';
                    button.textContent = '';
                    button.onclick = null;
                });

                // If no options, add click to close
                if (!node.options || node.options.length === 0) {
                    dialogueModal.onclick = () => {
                        dialogueModal.classList.add('hidden');
                    };
                    return;
                }

                // Display options
                node.options.forEach((option, index) => {
                    if (index < optionButtons.length) {
                        const button = optionButtons[index];
                        button.style.display = 'block';
                        button.textContent = option.text;
                        button.onclick = () => {
                            if (option.nextId) {
                                const nextNode = dialogue.nodes.find(n => n.id === option.nextId);
                                displayNode(nextNode);
                            } else {
                                dialogueModal.classList.add('hidden');
                            }
                        };
                    }
                });
            }

            // Show dialogue modal
            dialogueModal.classList.remove('hidden');
            
            // Start with the start node
            const startNode = dialogue.nodes.find(node => node.id === 'start');
            displayNode(startNode);
        };
    </script>
</body>
</html>`;

        writeFileSync('dialogue-test-results.html', html);
    }
}

// Create reporter instance
const reporter = new HTMLReporter();

describe('NPC Dialogue Tests', () => {
    describe('Dialogue File Loading', () => {
        for (const npcDir of npcDirs) {
            const npcPath = join(npcBaseDir, npcDir);
            const npcFiles = readdirSync(npcPath)
                .filter(file => file.endsWith('.js') && file !== `${npcDir}.js`);

            for (const dialogueFile of npcFiles) {
                it(`should load dialogue file ${npcDir}/${dialogueFile}`, async function() {
                    this.file = `${npcDir}/${dialogueFile}`;
                    try {
                        const dialogueModule = await import(`../Data/NPCs/${npcDir}/${dialogueFile}`);
                        
                        // Check if module has default export
                        if (!dialogueModule.default) {
                            throw new Error(`File ${dialogueFile} does not have a default export`);
                        }
                        
                        // Check if default export has nodes property
                        if (!dialogueModule.default.nodes) {
                            throw new Error(`File ${dialogueFile} default export does not have a 'nodes' property`);
                        }
                        
                        // Check if nodes is an array
                        if (!Array.isArray(dialogueModule.default.nodes)) {
                            throw new Error(`File ${dialogueFile} 'nodes' property is not an array`);
                        }
                        
                        expect(dialogueModule.default).to.be.an('object');
                        expect(dialogueModule.default.nodes).to.be.an('array');

                        // Store dialogue data for display
                        this.dialogue = dialogueModule.default;
                    } catch (error) {
                        if (error.code === 'ERR_MODULE_NOT_FOUND') {
                            throw new Error(`Failed to load ${dialogueFile}: File not found or import error`);
                        } else if (error.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
                            throw new Error(`Failed to load ${dialogueFile}: Invalid file extension or module format`);
                        } else {
                            throw new Error(`Failed to load ${dialogueFile}: ${error.message}`);
                        }
                    }
                    reporter.addResult({ ...this, state: 'passed' });
                });
            }
        }
    });

    describe('Dialogue Structure Validation', () => {
        for (const npcDir of npcDirs) {
            const npcPath = join(npcBaseDir, npcDir);
            const npcFiles = readdirSync(npcPath)
                .filter(file => file.endsWith('.js') && file !== `${npcDir}.js`);

            for (const dialogueFile of npcFiles) {
                it(`should validate structure of ${npcDir}/${dialogueFile}`, async function() {
                    this.file = `${npcDir}/${dialogueFile}`;
                    try {
                        const dialogueModule = await import(`../Data/NPCs/${npcDir}/${dialogueFile}`);
                        const dialogue = dialogueModule.default;

                        // Check basic structure
                        if (!Array.isArray(dialogue.nodes)) {
                            throw new Error(`File ${dialogueFile}: 'nodes' property is not an array`);
                        }
                        if (dialogue.nodes.length === 0) {
                            throw new Error(`File ${dialogueFile}: 'nodes' array is empty`);
                        }

                        // Check if dialogue starts with a "start" node
                        const startNode = dialogue.nodes.find(node => node.id === 'start');
                        if (!startNode) {
                            throw new Error(`File ${dialogueFile}: Missing required 'start' node`);
                        }

                        // Check if all nodes are accessible
                        const accessibleNodes = new Set(['start']);
                        const nodesToCheck = new Set(['start']);
                        
                        while (nodesToCheck.size > 0) {
                            const currentNodeId = Array.from(nodesToCheck)[0];
                            nodesToCheck.delete(currentNodeId);
                            
                            const currentNode = dialogue.nodes.find(node => node.id === currentNodeId);
                            if (currentNode && currentNode.options) {
                                currentNode.options.forEach(option => {
                                    if (option.nextId) {
                                        const targetNode = dialogue.nodes.find(node => node.id === option.nextId);
                                        if (!targetNode) {
                                            console.error(`Invalid nextId reference in ${dialogueFile}: Node "${currentNode.id}" has an option pointing to non-existent node ID "${option.nextId}"`);
                                        }
                                        if (!accessibleNodes.has(option.nextId)) {
                                            accessibleNodes.add(option.nextId);
                                            nodesToCheck.add(option.nextId);
                                        }
                                    }
                                });
                            }
                        }

                        // Check for unreachable nodes
                        const unreachableNodes = dialogue.nodes
                            .filter(node => !accessibleNodes.has(node.id))
                            .map(node => node.id);
                        
                        if (unreachableNodes.length > 0) {
                            throw new Error(`File ${dialogueFile}: Found unreachable nodes: ${unreachableNodes.join(', ')}`);
                        }

                        // Check for end nodes (nodes that have no nextId in their options)
                        const hasEndNode = dialogue.nodes.some(node => {
                            if (!node.options || node.options.length === 0) return true;
                            return node.options.some(option => option.nextId === null || option.nextId === undefined);
                        });

                        if (!hasEndNode) {
                            throw new Error(`File ${dialogueFile}: No end nodes found. At least one node must have an option with nextId: null or no nextId`);
                        }
                        
                        

                        // Validate each node
                        dialogue.nodes.forEach((node, index) => {
                            // Check required fields
                            if (!node.id) {
                                throw new Error(`File ${dialogueFile}: Node at index ${index} is missing 'id' property`);
                            }
                            if (!node.text) {
                                throw new Error(`File ${dialogueFile}: Node at index ${index} is missing 'text' property`);
                            }

                            // Check options if they exist
                            if (node.options) {
                                if (!Array.isArray(node.options)) {
                                    throw new Error(`File ${dialogueFile}: Node ${node.id} has 'options' that is not an array`);
                                }
                                node.options.forEach((option, optIndex) => {
                                    if (!option.text) {
                                        throw new Error(`File ${dialogueFile}: Node ${node.id}, Option ${optIndex} is missing 'text' property`);
                                    }
                                    if (option.nextId) {
                                        const nextNodeExists = dialogue.nodes.some(n => n.id === option.nextId);
                                        if (!nextNodeExists) {
                                            throw new Error(`File ${dialogueFile}: Node ${node.id}, Option ${optIndex} points to non-existent node ID: ${option.nextId}`);
                                        }
                                    }
                                });
                            }

                            // Check actions if they exist
                            if (node.action) {
                                const actions = Array.isArray(node.action) ? node.action : [node.action];
                                actions.forEach((action, actionIndex) => {
                                    if (!action.type) {
                                        throw new Error(`File ${dialogueFile}: Node ${node.id}, Action ${actionIndex} is missing 'type' property`);
                                    }
                                    if (!validActionTypes.includes(action.type)) {
                                        throw new Error(`File ${dialogueFile}: Node ${node.id}, Action ${actionIndex} has invalid action type: ${action.type}`);
                                    }
                                });
                            }
                        });
                    } catch (error) {
                        reporter.addResult({ ...this, state: 'failed', err: error });
                        throw error;
                    }
                    reporter.addResult({ ...this, state: 'passed' });
                });
            }
        }
    });

    describe('Action Handler Compatibility', () => {
        for (const npcDir of npcDirs) {
            const npcPath = join(npcBaseDir, npcDir);
            const npcFiles = readdirSync(npcPath)
                .filter(file => file.endsWith('.js') && file !== `${npcDir}.js`);

            for (const dialogueFile of npcFiles) {
                it(`should validate actions in ${npcDir}/${dialogueFile}`, async function() {
                    this.file = `${npcDir}/${dialogueFile}`;
                    try {
                        const dialogueModule = await import(`../Data/NPCs/${npcDir}/${dialogueFile}`);
                        const dialogue = dialogueModule.default;

                        // Check all nodes for actions
                        dialogue.nodes.forEach(node => {
                            // Check node-level actions
                            if (node && node.action) {
                                const actions = Array.isArray(node.action) ? node.action : [node.action];
                                actions.forEach((action, actionIndex) => {
                                    if (!action.type) {
                                        throw new Error(`File ${dialogueFile}: Node ${node.id}, Action ${actionIndex} is missing 'type' property`);
                                    }
                                    if (!validActionTypes.includes(action.type)) {
                                        throw new Error(`File ${dialogueFile}: Node ${node.id}, Action ${actionIndex} has invalid action type: ${action.type}. Valid types are: ${validActionTypes.join(', ')}`);
                                    }
                                });
                            }

                            // Check option-level actions
                            if (node && node.options) {
                                node.options.forEach((option, optIndex) => {
                                    if (option && option.action) {
                                        const actions = Array.isArray(option.action) ? option.action : [option.action];
                                        actions.forEach((action, actionIndex) => {
                                            if (!action.type) {
                                                throw new Error(`File ${dialogueFile}: Node ${node.id}, Option ${optIndex}, Action ${actionIndex} is missing 'type' property`);
                                            }
                                            if (!validActionTypes.includes(action.type)) {
                                                throw new Error(`File ${dialogueFile}: Node ${node.id}, Option ${optIndex}, Action ${actionIndex} has invalid action type: ${action.type}. Valid types are: ${validActionTypes.join(', ')}`);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } catch (error) {
                        reporter.addResult({ ...this, state: 'failed', err: error });
                        throw error;
                    }
                    reporter.addResult({ ...this, state: 'passed' });
                });
            }
        }
    });

    after(() => {
        reporter.generateReport();
    });
}); 