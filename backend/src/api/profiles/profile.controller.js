import db from '../../config/db.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

export const getMyProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    let profile;

    const userQuery = 'SELECT id, first_name, last_name, email, role FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
        return next(new AppError('User for this profile not found.', 404));
    }
    
    const user = userResult.rows[0];
    let profileData = {};

    if (user.role === 'Job Seeker') {
        const seekerResult = await db.query('SELECT headline, summary, skills, resume_url FROM job_seeker_profiles WHERE user_id = $1', [userId]);
        profileData = seekerResult.rows[0];
    } else if (user.role === 'Employer') {
        const employerResult = await db.query('SELECT name, description, website FROM companies WHERE user_id = $1', [userId]);
        profileData = employerResult.rows[0];
    }

    // Combine user data with role-specific profile data
    const fullProfile = { ...user, ...profileData };
    res.status(200).json({ status: 'success', data: { profile: fullProfile } });
});

export const updateMyProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const updates = req.body;
    const resumeFile = req.file;

    try {
        await db.query('BEGIN');

        if (updates.firstName || updates.lastName) {
            await db.query('UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3', [updates.firstName, updates.lastName, userId]);
        }

        if (req.user.role === 'Job Seeker') {
            const { headline, summary, skills } = updates;
            if (headline || summary || skills) {
                const skillsArray = skills ? `{${skills.split(',').map(skill => `"${skill.trim()}"`).join(',')}}` : null;
                await db.query('UPDATE job_seeker_profiles SET headline = $1, summary = $2, skills = $3 WHERE user_id = $4', [headline, summary, skillsArray, userId]);
            }
            if (resumeFile) {
                await db.query(`UPDATE job_seeker_profiles SET resume_url = $1 WHERE user_id = $2`, [resumeFile.path, userId]);
            }
        } else if (req.user.role === 'Employer') {
            const { companyName, companyDescription, website } = updates;
            if (companyName || companyDescription || website) {
                await db.query('UPDATE companies SET name = $1, description = $2, website = $3 WHERE user_id = $4', [companyName, companyDescription, website, userId]);
            }
        }

        await db.query('COMMIT');
    } catch (err) {
        await db.query('ROLLBACK');
        console.error("PROFILE UPDATE FAILED, TRANSACTION ROLLED BACK:", err);
        return next(new AppError('Failed to update profile. Please try again.', 500));
    }
    
    // After updating, re-fetch and send back the complete, fresh data
    const userResult = await db.query('SELECT id, first_name, last_name, email, role FROM users WHERE id = $1', [userId]);
    const updatedUser = userResult.rows[0];
    let profileData = {};
    if (updatedUser.role === 'Job Seeker') {
        const seekerResult = await db.query('SELECT * FROM job_seeker_profiles WHERE user_id = $1', [userId]);
        profileData = seekerResult.rows[0];
    } else if (updatedUser.role === 'Employer') {
        const employerResult = await db.query('SELECT * FROM companies WHERE user_id = $1', [userId]);
        profileData = employerResult.rows[0];
    }
    const fullProfile = { ...updatedUser, ...profileData };

    res.status(200).json({ status: 'success', data: { user: updatedUser, profile: fullProfile } });
});