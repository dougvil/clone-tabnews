import { create } from 'domain';

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },

    // For reference, the original TabNews username field has a maximum of 30 characters.
    username: {
      type: 'varchar(30)',
      notNull: true,
      unique: true,
    },

    // 254 is the maximum length for an email address as per RFC 5321.
    email: {
      type: 'varchar(254)',
      notNull: true,
      unique: true,
    },

    password: {},

    // Timestamp with time zone is used to ensure that the created_at field is stored in a consistent format regardless of the server's time zone.
    created_at: {
      type: 'timestamptz',
      default: pgm.func('now()'),
    },

    updated_at: {
      type: 'timestamptz',
      default: pgm.func('now()'),
    },
  });
};
