# generator-jhipster-playwright

[![CI](https://github.com/sreeshanth-soma/generator-jhipster-playwright/actions/workflows/ci.yml/badge.svg)](https://github.com/sreeshanth-soma/generator-jhipster-playwright/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/generator-jhipster-playwright.svg)](https://www.npmjs.com/package/generator-jhipster-playwright)

> A JHipster blueprint that replaces the generated Cypress end-to-end suite with Playwright.

## Introduction

This is a JHipster blueprint. It overrides the `cypress` sub-generator and writes Playwright files instead of Cypress files for generated applications.

Verified against freshly generated React and Angular JHipster applications — all tests passing, no failures or flakiness.

## Installation

```bash
npm install -g generator-jhipster@9.0.0
npm install -g generator-jhipster-playwright
```

## Usage

### How to Generate Code

This package exposes a dedicated CLI:

```bash
jhipster-playwright
```

It can also be used through the standard JHipster CLI:

```bash
jhipster --blueprints playwright
```

For available options, you can run:

```bash
jhipster-playwright app --help
```

### Enable the Cypress Test Framework

This blueprint overrides JHipster's `cypress` sub-generator. Upstream JHipster only composes that generator when `testFrameworks` includes `cypress`, so Playwright generation must be triggered with Cypress selected.

Use one of these approaches:

```bash
jhipster --blueprints playwright --test-frameworks cypress
jhipster-playwright --test-frameworks cypress
jhipster jdl app.jdl --blueprints playwright --test-frameworks cypress
```

You can also express this directly in JDL:

```jdl
application {
  config {
    baseName myApp
    clientFramework react
    testFrameworks [cypress]
  }
}
```

### How to Run the Generated Tests

```bash
jhipster jdl app.jdl --blueprints playwright --test-frameworks cypress --skip-install --force
```

After generation, install dependencies, install the Playwright browser, start the backend, and run the suite:

```bash
npm install
npx playwright install chromium
./mvnw
```

In a second terminal:

```bash
npx playwright test
```

The generated `playwright.config.ts` starts the frontend dev server automatically. The Spring Boot backend still needs to be running before the tests execute.

### Generated Output

The blueprint writes:

- `playwright.config.ts`
- Playwright support utilities under `src/test/javascript/playwright/support`
- Account, administration, and entity specs under `src/test/javascript/playwright/e2e`
- `@playwright/test` and Playwright npm scripts in the generated application's `package.json`

For Angular applications, the blueprint also adds `@popperjs/core` to the generated app dependencies so the generated frontend has the required Popper peer dependency available.

## Local Development

To work on the blueprint locally:

```bash
npm install
npm test
npm pack --dry-run --cache ./.npm-cache
```

To exercise the blueprint locally against a generated app, link it first:

```bash
npm link
```

Then in the target app directory:

```bash
npm link generator-jhipster-playwright
jhipster --blueprints playwright --test-frameworks cypress --skip-install --force
```

## Updated generator-jhipster

This blueprint currently targets `generator-jhipster` `9.0.0`.

If you want to run it through the standard JHipster CLI, install a compatible JHipster version and use:

```bash
npm install -g generator-jhipster@9.0.0
jhipster --blueprints playwright --test-frameworks cypress
```

## License

Apache 2.0, see [LICENSE](LICENSE).
