import db from '../../config/db.js';
import catchAsync from '../../utils/catchAsync.js';

export const getMyApplications = catchAsync(async (req, res, next) => {
    const seekerId = req.user.id;
    const query = `
        SELECT 
            a.id as "applicationId",
            a.status,
            a.applied_at,
            j.id as "jobId",
            j.title,
            j.location,
            c.name as "companyName"
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE a.user_id = $1
        ORDER BY a.applied_at DESC
    `;
    const { rows } = await db.query(query, [seekerId]);
    res.status(200).json({ status: 'success', data: { applications: rows } });
});