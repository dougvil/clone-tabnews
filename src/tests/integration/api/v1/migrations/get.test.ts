import orquestrator from 'tests/orquestrator';

beforeAll(async () => {
  await orquestrator.waitForAllServices();
  await orquestrator.clearDatabase();
});

describe('GET /api/v1/migrations', () => {
  describe('Anonymous user', () => {
    describe('when running pending migrations', () => {
      test('for the first time', async () => {
        const res = await fetch('http://localhost:3000/api/v1/migrations');
        expect(res.status).toBe(200);

        const responseBody = await res.json();
        expect(Array.isArray(responseBody)).toEqual(true);
        expect(responseBody.length).toBeGreaterThan(0);
      }, 10000);
      test('for the second time', async () => {
        const res = await fetch('http://localhost:3000/api/v1/migrations');
        expect(res.status).toBe(200);

        const responseBody = await res.json();
        expect(Array.isArray(responseBody)).toEqual(true);
        expect(responseBody.length).toBeGreaterThan(0);
      });
    });
  });
});
