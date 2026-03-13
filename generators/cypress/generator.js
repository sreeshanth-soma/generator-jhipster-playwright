import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, checkBlueprint: true });
  }

  async beforeQueue() {
    await this.dependsOnJHipster('bootstrap-application');
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      setPlaywrightProperties({ application }) {
        // Set the playwright directory path
        application.playwrightDir = `${application.clientTestDir}playwright/`;
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async writePlaywrightFiles({ application }) {
        // For now, just generate a minimal playwright.config.ts to prove the blueprint works
        await this.writeFiles({
          sections: {
            playwrightConfig: [
              {
                templates: ['playwright.config.ts'],
              },
            ],
          },
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      addPlaywrightDependencies({ application }) {
        if (!application.clientFrameworkBuiltIn) return;

        const packageJsonStorage = this.createStorage(
          this.destinationPath(application.clientRootDir || '', 'package.json'),
        );
        const devDependencies = packageJsonStorage.createStorage('devDependencies');
        devDependencies.set('@playwright/test', '1.58.2');

        const scriptsStorage = packageJsonStorage.createStorage('scripts');
        scriptsStorage.set('playwright', 'npx playwright test --ui');
        scriptsStorage.set('e2e', 'npx playwright test --headed');
        scriptsStorage.set('e2e:headless', 'npx playwright test');
      },
    });
  }
}
