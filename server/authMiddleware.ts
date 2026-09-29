import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface UserJwtPayload extends JwtPayload {
  id: string;
  role: string;
  email: string;
}

if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'development') {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not set in ' + process.env.NODE_ENV + '.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Use http-only cookie for secure token storage
  const token = req.cookies?.auth_token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
};
