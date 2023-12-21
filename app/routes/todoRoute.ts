import express from 'express';
import client from '../db';
import { redisClient } from '../redis';

const todoRoute = express();

todoRoute.get('/', async (req, res) => {
  const result = await client.query(
    'SELECT todos.*, users.* FROM todos INNER JOIN users ON todos.user_id = users.id'
  );

  res.json({ msg: 'Success', data: result.rows });
});

todoRoute.post('/', async (req, res) => {
  try {
    const { userId, title } = req.body;
    const result = await client.query(
      'INSERT INTO todos(title, user_id) VALUES($1, $2) RETURNING *',
      [title, userId]
    );
    res.json({ msg: 'Successfully Created', data: result.rows[0] });
  } catch (error: any) {
    res.json({ error: error?.message });
  }
});

export default todoRoute;
