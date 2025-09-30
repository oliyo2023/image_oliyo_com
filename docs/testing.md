# Testing Guide

This guide explains how to run tests for the AI Image Generation and Editing Website.

## Prerequisites

Before running tests, make sure you have:
1. Installed all dependencies with `npm install`
2. Set up the database with `npm run db:migrate`
3. Initialized the database with `npm run db:init`

## Running Tests

### Unit Tests

To run all unit tests:
```bash
npm run test:unit
```

To run specific unit test files:
```bash
npm run test:unit tests/unit/test_auth_service.py
npm run test:unit tests/unit/test_image_service.py
npm run test:unit tests/unit/test_payment_service.py
npm run test:unit tests/unit/test_user_service.py
```

### Integration Tests

To run all integration tests:
```bash
npm run test:integration
```

To run specific integration test files:
```bash
npm run test:integration tests/integration/test_auth.py
npm run test:integration tests/integration/test_image_gen.py
npm run test:integration tests/integration/test_image_edit.py
npm run test:integration tests/integration/test_payment.py
```

### Contract Tests

To run all contract tests:
```bash
npm run test:contract
```

To run specific contract test files:
```bash
npm run test:contract tests/contract/test_auth.py
npm run test:contract tests/contract/test_image.py
npm run test:contract tests/contract/test_payment.py
npm run test:contract tests/contract/test_admin.py
```

### End-to-End Tests

To run all end-to-end tests:
```bash
npm run test:e2e
```

### All Tests

To run all tests at once:
```bash
npm test
```

## Test Structure

The tests are organized in the following structure:
```
tests/
├── unit/              # Unit tests for individual functions and components
│   ├── test_auth_service.py
│   ├── test_image_service.py
│   ├── test_payment_service.py
│   └── test_user_service.py
├── integration/       # Integration tests for combined functionality
│   ├── test_auth.py
│   ├── test_image_gen.py
│   ├── test_image_edit.py
│   └── test_payment.py
├── contract/          # Contract tests for API endpoints
│   ├── test_auth.py
│   ├── test_image.py
│   ├── test_payment.py
│   └── test_admin.py
└── e2e/               # End-to-end tests for user flows
    ├── test_user_registration.py
    ├── test_image_generation.py
    ├── test_image_editing.py
    └── test_credit_management.py
```

## Writing Tests

When writing new tests, follow these guidelines:
1. Place unit tests in `tests/unit/`
2. Place integration tests in `tests/integration/`
3. Place contract tests in `tests/contract/`
4. Place end-to-end tests in `tests/e2e/`
5. Use descriptive test names that explain what is being tested
6. Follow the existing test structure and patterns
7. Ensure tests are independent and can run in isolation
8. Clean up any test data after the test runs

## Continuous Integration

All tests are automatically run in the CI pipeline before merging pull requests. Make sure all tests pass locally before submitting a PR.

## Troubleshooting

If tests are failing:
1. Check that the database is running and properly configured
2. Verify that all environment variables are set correctly
3. Ensure dependencies are installed with `npm install`
4. Run database migrations with `npm run db:migrate`
5. Initialize the database with `npm run db:init`
6. Check the test logs for specific error messages