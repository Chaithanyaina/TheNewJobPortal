import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../config/db.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

const signToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id, user.role);
    delete user.password_hash;
    res.status(statusCode).json({ status: 'success', token, data: { user } });
};

export const signup = catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password, role, companyName } = req.body;
    const resumeFile = req.file; // multer.single() provides req.file

    if (!['Job Seeker', 'Employer'].includes(role)) {
        return next(new AppError('Invalid role specified.', 400));
    }

    if (role === 'Job Seeker' && !resumeFile) {
        return next(new AppError('A resume (PDF) is mandatory to sign up as a Job Seeker.', 400));
    }
    if (role === 'Employer' && (!companyName || companyName.trim() === '')) {
        return next(new AppError('Company name is required for employers.', 400));
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    await db.query('BEGIN');
    try {
        const newUserQuery = 'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const { rows } = await db.query(newUserQuery, [firstName, lastName, email, passwordHash, role]);
        const newUser = rows[0];

        if (role === 'Employer') {
            await db.query('INSERT INTO companies (user_id, name) VALUES ($1, $2)', [newUser.id, companyName]);
        } else { // Job Seeker
            // The resumeFile is guaranteed to exist because of the check above
            await db.query('INSERT INTO job_seeker_profiles (user_id, resume_url) VALUES ($1, $2)', [newUser.id, resumeFile.path]);
        }
        
        await db.query('COMMIT');
        createSendToken(newUser, 201, res);
    } catch (err) {
        await db.query('ROLLBACK');
        if (err.code === '23505') {
          return next(new AppError('An account with this email already exists.', 409));
        }
        next(err);
    }
});

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return next(new AppError('Incorrect email or password', 401));
    }
    createSendToken(user, 200, res);
});