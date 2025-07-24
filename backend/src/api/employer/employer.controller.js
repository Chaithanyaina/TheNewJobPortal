import db from '../../config/db.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';

export const getMyJobs = catchAsync(async (req, res, next) => {
    const employerId = req.user.id;
    const query = `
        SELECT j.*, 
               (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as "applicantCount"
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE c.user_id = $1
        ORDER BY j.created_at DESC
    `;
    const { rows } = await db.query(query, [employerId]);
    res.status(200).json({ status: 'success', data: { jobs: rows } });
});

export const getJobApplicants = catchAsync(async (req, res, next) => {
    const { jobId } = req.params;
    const employerId = req.user.id;

    // First, verify the employer owns this job to prevent unauthorized access
    const ownershipCheck = await db.query(
        'SELECT j.id FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = $1 AND c.user_id = $2',
        [jobId, employerId]
    );
    if (ownershipCheck.rows.length === 0) {
        return next(new AppError('You are not authorized to view applicants for this job.', 403));
    }

    // If ownership is confirmed, fetch the applicants
    const query = `
        SELECT 
            a.id as "applicationId", 
            a.status, 
            a.applied_at,
            u.first_name, 
            u.last_name, 
            u.email,
            p.resume_url
        FROM applications a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN job_seeker_profiles p ON u.id = p.user_id
        WHERE a.job_id = $1
        ORDER BY a.applied_at DESC
    `;
    const { rows } = await db.query(query, [jobId]);
    res.status(200).json({ status: 'success', data: { applicants: rows } });
});

export const updateApplicationStatus = catchAsync(async (req, res, next) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    const employerId = req.user.id;

    const checkQuery = `
        SELECT a.id FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE a.id = $1 AND c.user_id = $2
    `;
    const ownershipCheck = await db.query(checkQuery, [applicationId, employerId]);
    if (ownershipCheck.rows.length === 0) {
        return next(new AppError('You are not authorized to update this application.', 403));
    }

    const query = 'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *';
    const { rows } = await db.query(query, [status, applicationId]);
    res.status(200).json({ status: 'success', data: { application: rows[0] } });
});