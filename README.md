# Playwright Sample Project

This is a sample Playwright testing project with Page Object Model implementation.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

- Run all tests: `npm test`
- Run tests in headed mode: `npm run test:headed`
- Run tests with UI: `npm run test:ui`
- Run specific browser: `npm run test:chrome`
- View report: `npm run report`

## Project Structure

- `tests/` - Test files
- `pages/` - Page Object Model classes
- `utils/` - Helper utilities
- `fixtures/` - Test data

## Features

- Page Object Model implementation
- Multi-browser testing
- Mobile testing
- CI/CD with GitHub Actions
- Comprehensive reporting
