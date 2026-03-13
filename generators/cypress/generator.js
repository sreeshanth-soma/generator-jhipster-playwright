import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { playwrightFiles, entityPlaywrightFiles } from './files.js';

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
        application.playwrightDir = `${application.clientTestDir}playwright/`;
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async writePlaywrightFiles({ application }) {
        await this.writeFiles({
          sections: playwrightFiles,
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      async writeEntityPlaywrightFiles({ application, entities }) {
        for (const entity of entities.filter(
          e => !e.builtIn && !e.embedded && !e.entityClientModelOnly
        )) {
          await this.writeFiles({
            sections: entityPlaywrightFiles,
            context: { ...application, ...entity },
          });
        }
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
