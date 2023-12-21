const dotenv = require('dotenv');
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';

import userRoute from './routes/userRoute';
import todoRoute from './routes/todoRoute';
import errorHandlerMiddleware from './error/errorMiddleware';

require('./redis');
require('./db');
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use('/users', userRoute);
app.use('/todos', todoRoute);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
});
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
