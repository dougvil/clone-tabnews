const { exec } = require('node:child_process');

function waitForPostgres() {
  exec('docker exec postgres-dev pg_isready --host localhost', handleReturn);

  function handleReturn(error) {
    if (error) {
      console.log('PostgreSQL is not ready yet. Retrying in 2 seconds...');
      setTimeout(waitForPostgres, 2000);
    } else {
      console.log('🟢 PostgreSQL is ready!');
      process.exit(0);
    }
  }
}

console.log('🔴 Waiting for PostgreSQL to be ready...');
waitForPostgres();
