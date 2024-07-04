const { Pool, Client } = require("pg");
require("dotenv").config();

//creating new data base if it does not exists.
async function createDatabaseIfNotExists() {
  const tempClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  await tempClient.connect();

  try {
    const res = await tempClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [process.env.DB_NAME]);
    if (res.rowCount === 0) {
      await tempClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database '${process.env.DB_NAME}' created.`);
    } else {
      console.log(`Database '${process.env.DB_NAME}' already exists.`);
    }
  } finally {
    await tempClient.end();
  }
}

async function initializePool() {
  await createDatabaseIfNotExists();

  return new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

const poolPromise = initializePool();

module.exports = {
  query: (text, params) => poolPromise.then(pool => pool.query(text, params)),
  connect: () => poolPromise.then(pool => pool.connect()),
};