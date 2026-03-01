import { NextResponse } from 'next/server';
import { RunnerOption, runner as migrationRunner } from 'node-pg-migrate';
import { join } from 'path';
import database from 'infra/database';
import { InternalServerError } from 'infra/errors';

const defaultMigrationOptions: Omit<RunnerOption, 'dbClient'> = {
  dir: join(process.cwd(), 'src', 'infra', 'migrations'),
  dryRun: true,
  direction: 'up',
  verbose: true,
  migrationsTable: 'pgmigrations',
};

export async function GET() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });
    return NextResponse.json(pendingMigrations);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while running migrations.' },
      { status: 500 },
    );
  } finally {
    console.log('Closing database connection');
    await dbClient?.end();
  }
}

export async function POST() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    if (migratedMigrations.length === 0) {
      return NextResponse.json([]);
    }
    return NextResponse.json(migratedMigrations, { status: 201 });
  } catch (error) {
    console.error(error);
    const newErr = new InternalServerError({ cause: error });
    return NextResponse.json(newErr, { status: newErr.statusCode });
  } finally {
    console.log('Closing database connection');
    await dbClient?.end();
  }
}
