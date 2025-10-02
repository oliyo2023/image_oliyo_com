// tests/setupTests.ts
// Jest setup file

// Mock global objects if needed
global.console = {
  ...console,
  // Comment out console.log to reduce noise in test output
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};