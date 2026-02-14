import database from 'infra/database';

async function clearDatabase() {
  await database.query('drop schema public cascade; create schema public;');
}

beforeAll(() => {
  return clearDatabase();
});

test('POST /api/v1/migrations', async () => {
  const res1 = await fetch('http://localhost:3000/api/v1/migrations', {
    method: 'POST',
  });
  expect(res1.status).toBe(201);

  const responseBody = await res1.json();
  expect(Array.isArray(responseBody)).toEqual(true);
  expect(responseBody.length).toBeGreaterThan(0);

  const res2 = await fetch('http://localhost:3000/api/v1/migrations', {
    method: 'POST',
  });
  expect(res2.status).toBe(200);

  const responseBody2 = await res2.json();
  expect(responseBody2).toEqual([]);
}, 10000);
