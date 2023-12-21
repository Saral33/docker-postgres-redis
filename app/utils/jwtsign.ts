import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import CustomError from '../error/CustomError';

interface AuthenticatedRequest extends Request {
  userId?: string;
}
const signJwt = (id: string) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: 60 * 60,
  });
  return token;
};

const decodeJwt = (token: string) => {
  try {
    const decodedJwt = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log(decodeJwt);
    return decodedJwt as any;
  } catch (error) {
    console.log({ error });
    new CustomError('JWT Expired', 500);
  }
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
  const decoded: any = jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err) => {
      if (err) {
        return next(new CustomError('Token Epxired', 500));
      }
    }
  );

  if (decoded) {
    req['userId'] = decoded.id;
    next();
  } else {
    new CustomError('Token Epxired', 500);
  }
};

export { signJwt, decodeJwt, authMiddleware };
