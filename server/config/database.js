'use strict';

const path = require('path');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const isPostgres = client === 'postgres' || client === 'postgresql';
  let connection;

  if (isPostgres) {
    const connectionString = env('DATABASE_URL', '');
    if (connectionString) {
      connection = {
        connectionString,
        ssl: env.bool('DATABASE_SSL', false) ? { rejectUnauthorized: false } : false,
        schema: env('DATABASE_SCHEMA', 'public'),
      };
    } else {
      connection = {
        host: env('DATABASE_HOST', '127.0.0.1'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'glycogourmet'),
        user: env('DATABASE_USERNAME', 'glycogourmet_user'),
        password: env('DATABASE_PASSWORD', ''),
        ssl: env.bool('DATABASE_SSL', false) ? { rejectUnauthorized: false } : false,
        schema: env('DATABASE_SCHEMA', 'public'),
      };
    }
  } else {
    connection = {
      filename: env('DATABASE_FILENAME', path.join(__dirname, '..', '.tmp/data.db')),
    };
  }

  return {
    connection: {
      client: isPostgres ? 'postgres' : client,
      connection,
      ...(isPostgres
        ? {
            pool: {
              min: env.int('DATABASE_POOL_MIN', 2),
              max: env.int('DATABASE_POOL_MAX', 10),
            },
          }
        : {
            useNullAsDefault: true,
          }),
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
