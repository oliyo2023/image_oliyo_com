// scripts/run-tests.js
const { spawn } = require('child_process');

// Function to run a command and wait for it to complete
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Function to run all tests
async function runAllTests() {
  try {
    console.log('Running all tests...');
    
    // Run unit tests
    console.log('\n--- Running Unit Tests ---');
    await runCommand('npm', ['run', 'test:unit']);
    
    // Run integration tests
    console.log('\n--- Running Integration Tests ---');
    await runCommand('npm', ['run', 'test:integration']);
    
    // Run contract tests
    console.log('\n--- Running Contract Tests ---');
    await runCommand('npm', ['run', 'test:contract']);
    
    // Run end-to-end tests
    console.log('\n--- Running End-to-End Tests ---');
    await runCommand('npm', ['run', 'test:e2e']);
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test run failed:', error.message);
    process.exit(1);
  }
}

// Function to run specific test type
async function runSpecificTests(testType) {
  try {
    console.log(`Running ${testType} tests...`);
    
    switch (testType) {
      case 'unit':
        await runCommand('npm', ['run', 'test:unit']);
        break;
      case 'integration':
        await runCommand('npm', ['run', 'test:integration']);
        break;
      case 'contract':
        await runCommand('npm', ['run', 'test:contract']);
        break;
      case 'e2e':
        await runCommand('npm', ['run', 'test:e2e']);
        break;
      default:
        console.error(`Unknown test type: ${testType}`);
        process.exit(1);
    }
    
    console.log(`\n✅ ${testType} tests completed successfully!`);
  } catch (error) {
    console.error(`\n❌ ${testType} test run failed:`, error.message);
    process.exit(1);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Run all tests
    await runAllTests();
  } else {
    // Run specific test type
    const testType = args[0];
    await runSpecificTests(testType);
  }
}

// Run the main function if this script is called directly
if (require.main === module) {
  main();
}

module.exports = { runAllTests, runSpecificTests };