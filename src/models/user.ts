import argon2 from 'argon2';
import database from 'infra/database';
import { NotFoundError, ValidationError } from 'infra/errors';
import { PublicUser } from 'types/api';
import { z } from 'zod';

const userSchema = z.object({
  username: z
    .string()
    .min(3, 'Username deve ter no mínimo 3 caracteres.')
    .max(30, 'Username deve ter no máximo 30 caracteres.')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username só pode conter letras, números, _ e -.',
    ),
  email: z.email('E-mail inválido.').max(254),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres.').max(72),
});

type UserInput = z.infer<typeof userSchema>;

async function create(userInputValues: UserInput) {
  try {
    await userSchema.parseAsync(userInputValues);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError({ message: 'Dados inválidos.' });
    }
  }
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUniqueEmail(email: string) {
    const result = await database.query({
      text: 'SELECT email FROM users WHERE LOWER(email) = LOWER($1);',
      values: [email],
    });
    if (!!result.rowCount) {
      throw new ValidationError({
        message: 'E-mail já está em uso.',
        action: 'Use um e-mail diferente e tente novamente.',
      });
    }
  }
  async function validateUniqueUsername(username: string) {
    const result = await database.query({
      text: 'SELECT username FROM users WHERE LOWER(username) = LOWER($1);',
      values: [username],
    });
    if (!!result.rowCount) {
      throw new ValidationError({
        message: 'Apelido já está em uso',
        action: 'Use um apelido diferente e tente novamente.',
      });
    }
  }

  async function runInsertQuery(userInputValues: UserInput) {
    const passwordHash = await argon2.hash(userInputValues.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MiB
      timeCost: 3,
      parallelism: 2,
    });

    const result = await database.query({
      text: `
      INSERT INTO
        users (username, email, password)
      VALUES
        (LOWER($1), LOWER($2), $3)
      RETURNING id, username, email, created_at, updated_at;
    `,
      values: [userInputValues.username, userInputValues.email, passwordHash],
    });
    return result.rows[0];
  }
}

async function findByUsername(username: string): Promise<PublicUser> {
  const result = await database.query({
    text: `
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE LOWER(username) = LOWER($1);
    `,
    values: [username],
  });

  if (!result.rowCount) {
    throw new NotFoundError({
      message: 'Usuário não encontrado.',
      action: 'Verifique se o username informado está correto.',
    });
  }

  return result.rows[0] as PublicUser;
}

const userModel = {
  userSchema,
  create,
  findByUsername,
};

export default userModel;
