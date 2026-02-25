import database from 'infra/database';
import orquestrator from 'tests/orquestrator';

async function clearDatabase() {
  await database.query('drop schema public cascade; create schema public;');
}

beforeAll(async () => {
  await orquestrator.waitForAllServices();

  return clearDatabase();
});

describe('POST /api/v1/migrations', () => {
  describe('Anonymous user', () => {
    describe('when running pending migrations', () => {
      test('for the first time', async () => {
        const res = await fetch('http://localhost:3000/api/v1/migrations', {
          method: 'POST',
        });
        expect(res.status).toBe(201);

        const responseBody = await res.json();
        expect(Array.isArray(responseBody)).toEqual(true);
        expect(responseBody.length).toBeGreaterThan(0);
      });
      test('for the second time', async () => {
        const res = await fetch('http://localhost:3000/api/v1/migrations', {
          method: 'POST',
        });
        expect(res.status).toBe(200);

        const responseBody2 = await res.json();
        expect(responseBody2).toEqual([]);
      });
    });
  });
});
