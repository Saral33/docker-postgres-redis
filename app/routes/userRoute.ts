import express from 'express';
import client from '../db';
import { redisClient } from '../redis';
import bcrypt from 'bcrypt';
import CustomError from '../error/CustomError';
import errorHandlerMiddleware from '../error/errorMiddleware';
import { authMiddleware, signJwt } from '../utils/jwtsign';
import jwt from 'jsonwebtoken';

const userRoute = express();

userRoute.get('/', async (req, res) => {
  const redisAllData = await redisClient.get('allusers');
  if (redisAllData) {
    res.json({ msg: 'Successfull', data: JSON.parse(redisAllData) });
  } else {
    const result = await client.query('SELECT * FROM users');
    await redisClient.setEx('allusers', 60, JSON.stringify(result.rows));
    res.json({ msg: 'Successfull', data: result.rows });
  }
});

userRoute.post('/register', async (req, res) => {
  const { name, phone, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await client.query(
      'INSERT INTO users(name, phone, email, password) VALUES($1, $2, $3, $4) RETURNING *',
      [name, phone, email, hashedPassword]
    );
    await redisClient.del('allusers');
    res.json({ msg: 'Successfully Created', data: result.rows[0] });
  } catch (error: any) {
    res.json({ msg: error?.message });
  }
});

userRoute.post(
  '/login',
  errorHandlerMiddleware(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      next(new CustomError('Please fill up all fields', 400));
    }

    const user = await client.query(
      `SELECT email,password,id FROM users WHERE email = $1 `,
      [email]
    );

    if (user.rowCount == 0) {
      throw new CustomError('Invalid Credentials', 500);
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!isPasswordValid) {
      throw new CustomError('Invalid Credentials', 500);
    }
    const token = await signJwt(user.rows[0].id, 'access');
    const refreshToken = signJwt(user.rows[0].email, 'refresh');
    const result = await client.query(
      'UPDATE users SET token = $1 WHERE id = $2',
      [refreshToken, user.rows[0].id]
    );

    if (result)
      res.json({
        msg: 'Successfully Login',
        data: { access_token: token, refresh_token: refreshToken },
      });
  })
);

// userRoute.get(
//   '/me',
//   authMiddleware,

//   errorHandlerMiddleware(async (req: any, res) => {
//     res.json({ req: req.userId });
//   })
// );

userRoute.post(
  '/refresh',
  errorHandlerMiddleware(async (req: any, res, next) => {
    const refreshToken = req.header('Authorization')?.split(' ')[1];
    if (!refreshToken) {
      throw new CustomError(
        'You are not logged in! Please log in to get access.',
        401
      );
    }
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
      async (err: jwt.VerifyErrors | null, data: any) => {
        if (err) {
          next(new CustomError('Invalid Token. Login again', 401));
        } else {
          const user = await client.query(
            'SELECT email,id FROM users WHERE email = $1',
            [data?.id]
          );
          if (user.rowCount == 0) {
            next(new CustomError('Invalid Token. Login again', 401));
          }
          const newToken = signJwt(user.rows[0].id, 'access');
          res.json({
            msg: 'Successfully Refreshed',
            data: { access_token: newToken },
          });
        }
      }
    );
  })
);
export default userRoute;
