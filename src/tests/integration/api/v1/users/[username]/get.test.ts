import orquestrator from 'tests/orquestrator';
import { version as uuidVersion } from 'uuid';

beforeAll(async () => {
  await orquestrator.waitForAllServices();
  await orquestrator.clearDatabase();
  await orquestrator.runPendingMigrations();
});

describe('GET /api/v1/users/[username]', () => {
  describe('Anonymous user', () => {
    test('With exact case match', async () => {
      await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'MatchCaseUser',
          email: 'matchcaseuser@email.com',
          password: 'password123',
        }),
      });

      const res = await fetch(
        'http://localhost:3000/api/v1/users/MatchCaseUser',
      );
      expect(res.status).toBe(200);

      const responseBody = await res.json();
      expect(responseBody).toEqual({
        data: {
          id: responseBody.data.id,
          username: 'matchcaseuser',
          email: 'matchcaseuser@email.com',
          created_at: responseBody.data.created_at,
          updated_at: responseBody.data.updated_at,
        },
      });
      expect(uuidVersion(responseBody.data.id)).toBe(4);
      expect(Date.parse(responseBody.data.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.data.updated_at)).not.toBeNaN();
      expect(responseBody.data).not.toHaveProperty('password');
    });

    test('With case-insensitive username lookup', async () => {
      await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'CaseInsensitiveUser',
          email: 'caseinsensitiveuser@email.com',
          password: 'password123',
        }),
      });

      const res = await fetch(
        'http://localhost:3000/api/v1/users/CASEINSENSITIVEUSER',
      );
      expect(res.status).toBe(200);

      const responseBody = await res.json();
      expect(responseBody.data.username).toBe('caseinsensitiveuser');
      expect(responseBody.data).not.toHaveProperty('password');
    });

    test('With non-existent username', async () => {
      const res = await fetch(
        'http://localhost:3000/api/v1/users/doesnotexist',
      );
      expect(res.status).toBe(404);

      const responseBody = await res.json();
      expect(responseBody).toEqual({
        name: 'NotFoundError',
        message: 'Usuário não encontrado.',
        action: 'Verifique se o username informado está correto.',
        status_code: 404,
      });
    });
  });
});
