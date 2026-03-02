import { join } from 'path';
import { RunnerOption, runner as migrationRunner } from 'node-pg-migrate';
import database from 'infra/database';
import { InternalServerError } from 'infra/errors';

const defaultMigrationOptions: Omit<RunnerOption, 'dbClient'> = {
  dir: join(process.cwd(), 'src', 'infra', 'migrations'),
  dryRun: true,
  direction: 'up',
  verbose: true,
  migrationsTable: 'pgmigrations',
};

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });
    return pendingMigrations;
  } catch (error) {
    console.error(error);
    throw new InternalServerError({ cause: error });
  } finally {
    console.log('Closing database connection');
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    if (migratedMigrations.length === 0) {
      return [];
    }
    return migratedMigrations;
  } catch (error) {
    console.error(error);
    throw new InternalServerError({ cause: error });
  } finally {
    console.log('Closing database connection');
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
