import type { NextApiRequest, NextApiResponse } from 'next';
import database from 'infra/database';

type DatabaseStatus = {
  version: string;
  max_connections: number;
  current_connections: number;
};

type StatusResponse = {
  updated_at: string;
  dependencies: {
    database: DatabaseStatus;
  };
};

export default async function status(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>,
) {
  const updatedAt = new Date().toISOString();

  const databaseVersion = await database.query({
    text: 'SHOW server_version;',
  });

  const maxConnections = await database.query({
    text: 'SHOW max_connections;',
  });

  const databaseName = process.env.POSTGRES_DB;
  const currentConnections = await database.query({
    text: `SELECT COUNT(*)::int FROM pg_stat_activity where datname = $1;`,
    values: [databaseName],
  });

  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersion.rows[0].server_version,
        max_connections: parseInt(maxConnections.rows[0].max_connections, 10),
        current_connections: currentConnections.rows[0].count,
      },
    },
  });
}
