import { Mocha } from 'mocha';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a new Mocha instance
const mocha = new Mocha({
    ui: 'bdd',
    timeout: 10000, // 10 seconds timeout for async operations
    reporter: 'spec'
});

// Add the test file
mocha.addFile(join(__dirname, 'database.test.js'));

// Run the tests
mocha.run((failures) => {
    process.exitCode = failures ? 1 : 0;
}); 