import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import CustomError from '../error/CustomError';

interface AuthenticatedRequest extends Request {
  userId?: string;
}
const signJwt = (id: string, type: 'access' | 'refresh') => {
  const secret =
    type === 'access' ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET;
  const token = jwt.sign({ id }, secret as string, {
    expiresIn: type === 'access' ? '10m' : 60 * 60,
  });
  return token;
};

const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token: string | undefined = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return next(
      new CustomError(
        'You are not logged in! Please log in to get access.',
        401
      )
    );
  }
  jwt.verify(token, process.env.JWT_SECRET as string, (err, data: any) => {
    if (err) {
      return next(new CustomError('Token Expired', 401));
    } else {
      req['userId'] = data.id;
      next();
    }
  });
};

export { signJwt, authMiddleware };
