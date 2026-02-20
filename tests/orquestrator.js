import retry from 'async-retry';

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

const orquestrator = {
  waitForAllServices,
};

export default orquestrator;
