import type { NextApiRequest, NextApiResponse } from 'next';
import migrationRunner, { RunnerOption } from 'node-pg-migrate';
import { join } from 'path';
import database from 'infra/database';

export default async function migrations(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const allowedMethods = ['GET', 'POST'];
  if (!allowedMethods.includes(req.method ?? '')) {
    return res.status(405).end();
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions: RunnerOption = {
      dbClient,
      dir: join(process.cwd(), 'infra', 'migrations'),
      dryRun: true,
      direction: 'up',
      verbose: true,
      migrationsTable: 'pgmigrations',
    };

    if (req.method === 'GET') {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return res.status(200).json(pendingMigrations);
    }

    if (req.method === 'POST') {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });
      if (migratedMigrations.length === 0) {
        return res.status(200).json([]);
      }
      return res.status(201).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: 'An error occurred while running migrations.' });
  } finally {
    console.log('Closing database connection');
    await dbClient?.end();
  }
}
