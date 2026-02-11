import database from 'infra/database';

async function status(req, res) {
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

export default status;
