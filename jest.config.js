module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/test_*.ts', '**/tests/**/*.test.ts', '**/tests/**/*.spec.ts'],
  testPathIgnorePatterns: ['<rootDir>/tests/contract', '<rootDir>/tests/integration', '<rootDir>/tests/performance'],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    '!lib/types/**',
    '!lib/middleware/**',  // We may want to add tests for middleware later
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
};