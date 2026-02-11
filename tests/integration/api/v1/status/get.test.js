test('GET /api/v1/status', async () => {
  const res = await fetch('http://localhost:3000/api/v1/status');
  expect(res.status).toBe(200);

  const responseBody = await res.json();

  const parsedDate = new Date(responseBody.updated_at).toISOString();
  expect(parsedDate).toBe(responseBody.updated_at); // Verifica se é uma data válida

  expect(responseBody.dependencies.database.version).toEqual('16.0');
  expect(responseBody.dependencies.database.max_connections).toEqual(100);
  expect(responseBody.dependencies.database.current_connections).toEqual(1);
});
