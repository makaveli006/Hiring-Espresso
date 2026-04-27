cd frontend

# Run all e2e tests (headless)
npm run test:e2e

# Run with interactive UI (recommended for debugging)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# View last test report
npm run test:e2e:report

cd frontend
npx playwright test tests/e2e/homepage/


npx playwright test --project=chromium

npx playwright test tests/e2e/auth/auth-modal.spec.ts --project=chromium