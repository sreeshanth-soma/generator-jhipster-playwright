/**
 * Playwright template file mappings.
 * Mirrors the Cypress files.ts structure from generator-jhipster.
 */
export const playwrightFiles = {
  common: [
    {
      templates: ['playwright.config.ts.ejs'],
    },
    {
      path: ctx => `${ctx.clientTestDir}playwright/`,
      templates: ['tsconfig.json'],
    },
    {
      path: ctx => `${ctx.clientTestDir}playwright/`,
      templates: [
        'support/commands.ts',
        'support/navbar.ts',
        'support/entity.ts',
        'support/management.ts',
        'support/index.ts',
      ],
    },
    {
      path: ctx => `${ctx.clientTestDir}playwright/`,
      condition: ctx => !ctx.authenticationTypeOauth2,
      templates: ['support/account.ts'],
    },
    {
      path: ctx => `${ctx.clientTestDir}playwright/`,
      condition: ctx => ctx.authenticationTypeOauth2,
      templates: ['support/oauth2.ts'],
    },
  ],
  e2eTests: [
    {
      path: ctx => `${ctx.clientTestDir}playwright/e2e/`,
      condition: ctx => !ctx.authenticationTypeOauth2,
      templates: ['account/login-page.spec.ts'],
    },
    {
      path: ctx => `${ctx.clientTestDir}playwright/e2e/`,
      templates: ['account/logout.spec.ts'],
    },
    {
      path: ctx => `${ctx.clientTestDir}playwright/e2e/`,
      condition: ctx => ctx.generateUserManagement,
      templates: [
        'account/register-page.spec.ts',
        'account/settings-page.spec.ts',
        'account/password-page.spec.ts',
        'account/reset-password-page.spec.ts',
      ],
    },
    {
      path: ctx => `${ctx.clientTestDir}playwright/e2e/`,
      templates: ['administration/administration.spec.ts'],
    },
  ],
  fixtures: [
    {
      path: ctx => `${ctx.clientTestDir}playwright/`,
      templates: [{ file: 'fixtures/integration-test.png', method: 'copy' }],
    },
  ],
};

export const entityPlaywrightFiles = {
  tests: [
    {
      path: ctx => `${ctx.clientTestDir}playwright/e2e/entity/`,
      templates: ['_entity_.spec.ts'],
    },
  ],
};
