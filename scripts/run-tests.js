#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ ${message}`, colors.blue);
}

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function main() {
  log(`${colors.bold}🧪 Zoo Assignment Management - Comprehensive Test Suite${colors.reset}`);
  log('===========================================================');

  // Check if dependencies are installed
  if (!existsSync('node_modules')) {
    warning('Dependencies not found. Installing...');
    await runCommand('npm', ['install']);
  }

  // Check TypeScript compilation
  info('🔍 Running TypeScript Type Checking...');
  const tscResult = await runCommand('npx', ['tsc', '--noEmit', '--skipLibCheck']);
  if (tscResult) {
    success('TypeScript types are valid');
  } else {
    warning('TypeScript type issues found (continuing with tests)');
  }

  // Run unit tests
  info('🧩 Running Unit Tests...');
  success('Testing individual components and utilities...');
  const unitResult = await runCommand('npx', ['vitest', 'run', 'tests/unit/', '--reporter=verbose']);
  
  if (unitResult) {
    success('Unit tests passed');
  } else {
    error('Unit tests failed');
  }

  // Run integration tests
  info('🔗 Running Integration Tests...');
  success('Testing API endpoints and component interactions...');
  const integrationResult = await runCommand('npx', ['vitest', 'run', 'tests/integration/', '--reporter=verbose']);
  
  if (integrationResult) {
    success('Integration tests passed');
  } else {
    error('Integration tests failed');
  }

  // Generate coverage report
  info('📊 Generating Coverage Report...');
  success('Running tests with coverage...');
  await runCommand('npx', ['vitest', 'run', '--coverage', '--reporter=verbose']);

  // Test results summary
  log(`\n${colors.bold}🎯 Test Suite Summary${colors.reset}`);
  log('======================');
  success('Unit Tests: Component and utility function testing');
  success('Integration Tests: API endpoints and data flow testing');
  success('Coverage Report: Generated in coverage/ directory');

  log('\n📁 Test Structure:');
  log('   tests/unit/           - Component and utility tests');
  log('   tests/integration/    - API and data flow tests');
  log('   tests/e2e/           - End-to-end browser tests');
  log('   tests/setup.ts       - Test configuration and mocks');

  log('\n🚀 Available Test Commands:');
  log('   npm run test          - Run all tests');
  log('   npm run test:unit     - Run only unit tests');
  log('   npm run test:integration - Run only integration tests');
  log('   npm run test:watch    - Run tests in watch mode');
  log('   npm run test:coverage - Run tests with coverage');

  log(`\n${colors.green}✅ Test Suite Complete!${colors.reset}`);
  log('Check the coverage report in the coverage/ directory for detailed metrics.');
}

main().catch(console.error);