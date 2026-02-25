import retry from 'async-retry';
import database from 'infra/database';

async function waitForAllServices() {
  await waitForWebServer();
  async function waitForWebServer() {
    return retry(fetchStatusPage, { retries: 50, minTimeout: 1000 });
    async function fetchStatusPage() {
      const res = await fetch('http://localhost:3000/api/v1/status');
      if (!res.ok) {
        throw new Error('Web server is not ready yet');
      }
    }
  }
}

async function clearDatabase() {
  await database.query('drop schema public cascade; create schema public;');
}

const orquestrator = {
  waitForAllServices,
  clearDatabase,
};

export default orquestrator;
