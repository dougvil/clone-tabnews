import database from 'infra/database';

async function clearDatabase() {
  await database.query('drop schema public cascade; create schema public;');
}

beforeAll(() => {
  return clearDatabase();
});

test('GET /api/v1/migrations', async () => {
  const res = await fetch('http://localhost:3000/api/v1/migrations');
  expect(res.status).toBe(200);

  const responseBody = await res.json();
  expect(Array.isArray(responseBody)).toEqual(true);
  expect(responseBody.length).toBeGreaterThan(0);
}, 10000);
