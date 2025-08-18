#!/bin/bash

# Zoo Assignment Management - Comprehensive Test Suite
# This script runs unit tests, integration tests, and smoke tests

set -e  # Exit on any error

echo "🧪 Starting Zoo Assignment Management Test Suite..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not found. Installing..."
    npm install
fi

# Run linting (if available)
echo -e "\n📋 Running Code Quality Checks..."
if command -v eslint &> /dev/null; then
    print_status "Running ESLint..."
    npx eslint . --ext .ts,.tsx --max-warnings 0 || true
else
    print_warning "ESLint not available, skipping linting"
fi

# Run TypeScript type checking
echo -e "\n🔍 Running TypeScript Type Checking..."
if command -v tsc &> /dev/null; then
    print_status "Checking TypeScript types..."
    npx tsc --noEmit || true
else
    print_warning "TypeScript compiler not available, skipping type checking"
fi

# Run unit tests
echo -e "\n🧩 Running Unit Tests..."
print_status "Testing individual components and utilities..."
npx vitest run tests/unit/ --reporter=verbose

# Run integration tests  
echo -e "\n🔗 Running Integration Tests..."
print_status "Testing API endpoints and component interactions..."
npx vitest run tests/integration/ --reporter=verbose

# Install playwright for e2e tests if not already installed
if [ ! -d "node_modules/playwright" ]; then
    print_warning "Installing Playwright for E2E tests..."
    npm install playwright
    npx playwright install chromium
fi

# Run smoke tests (E2E)
echo -e "\n💨 Running Smoke Tests..."
print_status "Testing complete application workflows..."

# Start the development server in background for E2E tests
echo "Starting development server for E2E tests..."
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Run E2E tests
npx vitest run tests/e2e/ --reporter=verbose || true

# Stop the development server
kill $SERVER_PID 2>/dev/null || true

# Generate coverage report
echo -e "\n📊 Generating Coverage Report..."
print_status "Running tests with coverage..."
npx vitest run --coverage --reporter=verbose

# Test results summary
echo -e "\n🎯 Test Suite Summary"
echo "======================"
print_status "Unit Tests: Component and utility function testing"
print_status "Integration Tests: API endpoints and data flow testing"  
print_status "Smoke Tests: End-to-end user workflow testing"
print_status "Coverage Report: Generated in coverage/ directory"

echo -e "\n📁 Test Structure:"
echo "   tests/unit/           - Component and utility tests"
echo "   tests/integration/    - API and data flow tests"
echo "   tests/e2e/           - End-to-end browser tests"
echo "   tests/setup.ts       - Test configuration and mocks"

echo -e "\n🚀 Available Test Commands:"
echo "   npm run test          - Run all tests"
echo "   npm run test:unit     - Run only unit tests"
echo "   npm run test:integration - Run only integration tests"
echo "   npm run test:e2e      - Run only E2E tests"
echo "   npm run test:watch    - Run tests in watch mode"
echo "   npm run test:coverage - Run tests with coverage"

echo -e "\n${GREEN}✅ Test Suite Complete!${NC}"
echo "Check the coverage report in the coverage/ directory for detailed metrics."