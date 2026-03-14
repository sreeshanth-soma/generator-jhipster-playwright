import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { createFaker } from 'generator-jhipster/generators/base-application/support';
import { generateTestEntity } from 'generator-jhipster/generators/client/support';

import { entityPlaywrightFiles, playwrightFiles } from './files.js';

/**
 * Simple Java-style string hash code (same as JHipster internal stringHashCode).
 * Used to seed faker for reproducible test data.
 */
function stringHashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
}

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
        // Set Cypress-specific defaults expected by entity template
        // (normally set by the Cypress generator's PREPARING phase)
        application.cypressBootstrapEntities ??= true;
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntityForTemplates({ entity }) {
        // Set entity-level defaults expected by entity test template
        // (normally set by Cypress generator's POST_PREPARING_EACH_ENTITY phase)
        entity.workaroundEntityCannotBeEmpty ??= false;
        entity.workaroundInstantReactiveMariaDB ??= false;
        entity.generateEntityCypress ??= !entity.skipClient || entity.builtInUserManagement;
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async writePlaywrightFiles({ application }) {
        const faker = await createFaker();
        faker.seed(stringHashCode(application.baseName));
        const context = { ...application, faker };
        await this.writeFiles({
          sections: playwrightFiles,
          context,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      async writeEntityPlaywrightFiles({ application, entities }) {
        for (const entity of entities.filter(
          e => e.generateEntityCypress && !e.builtInUser && !e.embedded && !e.entityClientModelOnly
        )) {
          const context = { ...application, ...entity };
          await this.writeFiles({
            sections: entityPlaywrightFiles,
            context,
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
        const dependencies = packageJsonStorage.createStorage('dependencies');
        const devDependencies = packageJsonStorage.createStorage('devDependencies');
        devDependencies.set('@playwright/test', '^1.58.2');
        devDependencies.set('eslint-plugin-playwright', '^2.9.0');

        if (application.clientFrameworkAngular) {
          // ng-bootstrap and Bootstrap both declare Popper as a peer dependency.
          dependencies.set('@popperjs/core', '^2.11.8');
        }

        const scriptsStorage = packageJsonStorage.createStorage('scripts');
        scriptsStorage.set('playwright', 'npx playwright test --ui');
        scriptsStorage.set('e2e', 'npx playwright test --headed');
        scriptsStorage.set('e2e:headless', 'npx playwright test');
      },
    });
  }

  generateTestEntity(fields) {
    return generateTestEntity(fields);
  }
}
