const { Client } = require('pg');
const client = new Client({
  user: process.env.POSTGRES_USER,
  host: 'db',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: '5432',
});
client
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL database!');
  })
  .catch((err: any) => {
    console.error('Error connecting to the database:', err);
  });
