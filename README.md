# generator-jhipster-playwright

[![CI](https://github.com/sreeshanth-soma/generator-jhipster-playwright/actions/workflows/ci.yml/badge.svg)](https://github.com/sreeshanth-soma/generator-jhipster-playwright/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/generator-jhipster-playwright.svg)](https://www.npmjs.com/package/generator-jhipster-playwright)

> A [JHipster](https://www.jhipster.tech/) blueprint that replaces Cypress end-to-end tests with [Playwright](https://playwright.dev/).

## Supported Matrix

| Framework | JWT | Session | OAuth2 |
|-----------|-----|---------|--------|
| React     | Yes | Yes     | Yes    |
| Angular   | Yes | Yes     | Yes    |
| Vue       | Yes | Yes     | Yes    |

All 9 combinations are verified in CI against freshly generated JHipster applications. OAuth2 tests run against a Keycloak instance.

## Prerequisites

- Java 21+
- Node 22+
- [JHipster](https://www.jhipster.tech/installation/) 9.x
- Docker (for OAuth2 / Keycloak)

## Installation

```bash
npm install -g generator-jhipster-playwright
```

## Usage

This blueprint overrides JHipster's `cypress` sub-generator, so Playwright generation is triggered by selecting `cypress` as the test framework.

### CLI

```bash
jhipster-playwright --test-frameworks cypress
```

Or through the standard JHipster CLI:

```bash
jhipster --blueprints playwright --test-frameworks cypress
```

### JDL

```jdl
application {
  config {
    baseName myApp
    clientFramework react
    authenticationType jwt
    testFrameworks [cypress]
  }
}
```

```bash
jhipster jdl app.jdl --blueprints playwright
```

### Running Tests

After generating, install dependencies and the Playwright browser:

```bash
npm install
npx playwright install chromium
```

For OAuth2 applications, start Keycloak first:

```bash
docker compose -f src/main/docker/keycloak.yml up -d
```

Start the Spring Boot backend:

```bash
./mvnw
```

In a second terminal, run the tests:

```bash
npx playwright test
```

The generated `playwright.config.ts` starts the frontend dev server automatically.

### Generated Output

- `playwright.config.ts`
- Support utilities under `src/test/javascript/playwright/support/`
- Account, administration, and entity specs under `src/test/javascript/playwright/e2e/`
- `@playwright/test` dependency and Playwright npm scripts in `package.json`

## Development

```bash
npm install
npm test
```

To test locally against a generated app:

```bash
npm link
```

Then in the target app directory:

```bash
npm link generator-jhipster-playwright
jhipster --blueprints playwright --test-frameworks cypress --skip-install --force
```

## License

Apache 2.0, see [LICENSE](LICENSE).
