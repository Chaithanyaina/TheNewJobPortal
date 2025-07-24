import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import db from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';

// ==============================
// Require Logged-in User
// ==============================
export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const { rows } = await db.query(
    'SELECT id, first_name, last_name, email, role FROM users WHERE id = $1',
    [decoded.id]
  );

  const currentUser = rows[0];

  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  req.user = currentUser;
  next();
});

// ==============================
// Optional Auth: Attach User if Logged In
// ==============================
export const checkUser = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(); // no token → proceed unauthenticated

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const { rows } = await db.query(
      'SELECT id, role FROM users WHERE id = $1',
      [decoded.id]
    );

    const currentUser = rows[0];
    if (currentUser) {
      req.user = currentUser;
    }
  } catch (err) {
    // Invalid token → ignore silently
  }

  next();
});

// ==============================
// Role-based Access Control
// ==============================
export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
