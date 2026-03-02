import orquestrator from 'tests/orquestrator';
import { version as uuidVersion } from 'uuid';

beforeAll(async () => {
  await orquestrator.waitForAllServices();
  await orquestrator.clearDatabase();
  await orquestrator.runPendingMigrations();
});

describe('POST /api/v1/users', () => {
  describe('Anonymous user', () => {
    test('With unique and valid datas', async () => {
      const res = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'John-Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        }),
      });
      expect(res.status).toBe(201);

      const responseBody = await res.json();

      expect(responseBody).toEqual({
        data: {
          id: responseBody.data.id,
          username: 'john-doe',
          email: 'john.doe@example.com',
          password: 'password123',
          created_at: responseBody.data.created_at,
          updated_at: responseBody.data.updated_at,
        },
      });
      expect(uuidVersion(responseBody.data.id)).toBe(4);
      expect(Date.parse(responseBody.data.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.data.updated_at)).not.toBeNaN();
    });

    test('With existing email typed in different case', async () => {
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'First-User',
          email: 'duplicated@email.com',
          password: 'password123',
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'Second-User',
          email: 'DUPLICATED@EMAIL.COM',
          password: 'password123',
        }),
      });
      expect(response2.status).toBe(400);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        name: 'ValidationError',
        message: 'E-mail já está em uso.',
        action: 'Use um e-mail diferente e tente novamente.',
        status_code: 400,
      });
    });

    test('With duplicated username', async () => {
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'DuplicatedUser',
          email: 'firstvalid@email.com',
          password: 'password123',
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'DuplicatedUser',
          email: 'secondvalid@email.com',
          password: 'password123',
        }),
      });
      expect(response2.status).toBe(400);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        name: 'ValidationError',
        message: 'Apelido já está em uso',
        action: 'Use um apelido diferente e tente novamente.',
        status_code: 400,
      });
    });

    test('With invalid data', async () => {
      const res = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'Invalid User',
          email: 'invalid-email',
          password: 'password123',
        }),
      });
      expect(res.status).toBe(400);
    });
  });
});
