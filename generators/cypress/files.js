/**
 * Playwright template file mappings.
 * Mirrors the Cypress files.ts structure from generator-jhipster v9.
 *
 * Pattern from Cypress:
 *   path: source template directory (relative to templates/)
 *   renameTo: (ctx, file) => output path in generated app
 *   templates: ['filename'] — JHipster auto-appends .ejs
 */

const PLAYWRIGHT_TEMPLATE_SOURCE_DIR = 'src/test/javascript/cypress/';

export const playwrightFiles = {
  common: [
    {
      templates: ['playwright.config.ts'],
    },
  ],
  clientTestFw: [
    {
      path: PLAYWRIGHT_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.clientTestDir}playwright/${file}`,
      templates: [
        'fixtures/integration-test.png',
        'e2e/administration/administration.spec.ts',
        'support/commands.ts',
        'support/navbar.ts',
        'support/index.ts',
        'support/entity.ts',
        'support/management.ts',
        'tsconfig.json',
      ],
    },
    {
      condition: generator => !generator.applicationTypeMicroservice,
      path: PLAYWRIGHT_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.clientTestDir}playwright/${file}`,
      templates: ['e2e/account/logout.spec.ts'],
    },
    {
      condition: generator => !generator.authenticationTypeOauth2,
      path: PLAYWRIGHT_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.clientTestDir}playwright/${file}`,
      templates: ['e2e/account/login-page.spec.ts'],
    },
    {
      condition: generator => Boolean(generator.generateUserManagement),
      path: PLAYWRIGHT_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.clientTestDir}playwright/${file}`,
      templates: [
        'e2e/account/register-page.spec.ts',
        'e2e/account/settings-page.spec.ts',
        'e2e/account/password-page.spec.ts',
        'e2e/account/reset-password-page.spec.ts',
        'support/account.ts',
      ],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: PLAYWRIGHT_TEMPLATE_SOURCE_DIR,
      renameTo: (ctx, file) => `${ctx.clientTestDir}playwright/${file}`,
      templates: ['support/oauth2.ts'],
    },
  ],
};

export const entityPlaywrightFiles = {
  tests: [
    {
      path: PLAYWRIGHT_TEMPLATE_SOURCE_DIR,
      renameTo: ctx => `${ctx.clientTestDir}playwright/e2e/entity/${ctx.entityFileName}.spec.ts`,
      templates: ['e2e/entity/_entity_.spec.ts'],
    },
  ],
};
