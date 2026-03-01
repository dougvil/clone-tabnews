import retry from 'async-retry';
import database from 'infra/database';

async function waitForAllServices(): Promise<void> {
  await waitForWebServer();

  async function waitForWebServer(): Promise<void> {
    return retry(fetchStatusPage, { retries: 50, minTimeout: 1000 });

    async function fetchStatusPage(): Promise<void> {
      const res = await fetch('http://localhost:3000/api/v1/status');
      if (!res.ok) {
        throw new Error('Web server is not ready yet');
      }
    }
  }
}

async function clearDatabase(): Promise<void> {
  await database.query('drop schema public cascade; create schema public;');
}

const orquestrator = {
  waitForAllServices,
  clearDatabase,
};

export default orquestrator;
