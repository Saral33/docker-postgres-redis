import axios from 'axios';
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
import express from 'express';
import { RedisClientType, createClient } from 'redis';

// const redis = require('redis');

require('./db');
const app = express();
app.use(express.json());
let client: RedisClientType;

(async () => {
  client = createClient({
    socket: {
      port: 6379,
      host: 'redis',
    },
  });
  client.on('error', (error: Error) => console.error(`Error : ${error}`));
  client.on('connect', () => console.log('Redis connected'));
  await client.connect();
})();

app.get('/:id', async (req: express.Request, res: express.Response) => {
  console.log(process.env.POSTGRES_USER);
  const test = await client.get(req.params.id);
  if (test) {
    res.send(`<h1>${JSON.parse(test).title}</h1>`);
  } else {
    const response = await axios.get(
      'https://jsonplaceholder.typicode.com/posts/' + req.params.id
    );
    await client.set(req.params.id, JSON.stringify(response.data));
    res.send(`<h1>${response.data.title}</h1>`);
  }
});
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
