import orquestrator from 'tests/orquestrator';

beforeAll(async () => {
  await orquestrator.waitForAllServices();
});

describe('POST /api/v1/status', () => {
  describe('Anonymous user', () => {
    test('Ensure method POST not allowed', async () => {
      const res = await fetch('http://localhost:3000/api/v1/status', {
        method: 'POST',
      });
      expect(res.status).toBe(405);
    });
  });
});
