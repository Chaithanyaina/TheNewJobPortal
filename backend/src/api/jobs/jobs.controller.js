import db from '../../config/db.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

export const getAllJobs = catchAsync(async (req, res, next) => {
    const { q, location, type, page = 1, limit = 9 } = req.query;

    let baseQuery = `
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.is_active = TRUE
    `;
    const params = [];
    let paramIndex = 1;

    if (q) {
        // --- THIS IS THE FIX ---
        // We now process the search query to support prefix matching (e.g., 'dev' matches 'developer')
        const searchTerms = q.trim().split(/\s+/);
        const formattedQuery = searchTerms
            .map((term, index) => {
                // Only add the prefix operator to the last word in the search
                if (index === searchTerms.length - 1) {
                    return term + ':*';
                }
                return term;
            })
            .join(' & ');
        
        baseQuery += ` AND j.tsv @@ to_tsquery('english', $${paramIndex++})`;
        params.push(formattedQuery);
    }
    if (location) {
        baseQuery += ` AND j.location ILIKE $${paramIndex++}`;
        params.push(`%${location}%`);
    }
    if (type) {
        baseQuery += ` AND j.type = $${paramIndex++}`;
        params.push(type);
    }

    // --- First, get the total count for pagination ---
    const countQuery = `SELECT COUNT(*) ${baseQuery}`;
    const countResult = await db.query(countQuery, params);
    const totalJobs = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalJobs / limit);

    // --- Second, get the job data with pagination ---
    const offset = (page - 1) * limit;
    const dataQuery = `
        SELECT j.id, j.title, j.location, j.type, j.posted_at, c.name AS "companyName"
        ${baseQuery}
        ORDER BY j.posted_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const dataParams = [...params, limit, offset];
    const { rows: jobs } = await db.query(dataQuery, dataParams);
    
    res.status(200).json({
        status: 'success',
        results: jobs.length,
        data: {
            jobs,
            pagination: {
                totalJobs,
                totalPages,
                currentPage: parseInt(page, 10),
            }
        }
    });
});

// --- NO CHANGES to the functions below, but they are included for completeness ---

export const getJobById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const jobQuery = `SELECT j.*, c.name AS "companyName" FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = $1 AND j.is_active = TRUE`;
    const jobResult = await db.query(jobQuery, [id]);
    if (jobResult.rows.length === 0) return next(new AppError('No job found with that ID', 404));
    const job = jobResult.rows[0];
    job.userHasApplied = false;
    if (userId) {
        const applicationQuery = 'SELECT id FROM applications WHERE user_id = $1 AND job_id = $2';
        const applicationResult = await db.query(applicationQuery, [userId, id]);
        if (applicationResult.rows.length > 0) job.userHasApplied = true;
    }
    res.status(200).json({ status: 'success', data: { job } });
});

export const createJob = catchAsync(async (req, res, next) => {
    const { title, description, responsibilities, qualifications, location, type } = req.body;
    const employerId = req.user.id;
    const companyResult = await db.query('SELECT id FROM companies WHERE user_id = $1', [employerId]);
    if (companyResult.rows.length === 0) return next(new AppError('Employer does not have a company profile.', 400));
    const companyId = companyResult.rows[0].id;
    const newJobQuery = `INSERT INTO jobs (company_id, title, description, responsibilities, qualifications, location, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const { rows } = await db.query(newJobQuery, [companyId, title, description, responsibilities, qualifications, location, type]);
    res.status(201).json({ status: 'success', data: { job: rows[0] } });
});

export const applyToJob = catchAsync(async (req, res, next) => {
    const { id: jobId } = req.params;
    const seekerId = req.user.id;
    const profileResult = await db.query('SELECT resume_url FROM job_seeker_profiles WHERE user_id = $1', [seekerId]);
    if (!profileResult.rows[0]?.resume_url) return next(new AppError('You must upload a resume to your profile before applying.', 400));
    try {
        await db.query( 'INSERT INTO applications (user_id, job_id) VALUES ($1, $2)', [seekerId, jobId]);
    } catch (err) {
        if (err.code === '23505') return next(new AppError('You have already applied to this job.', 409));
        throw err;
    }
    const jobQuery = `SELECT j.*, c.name AS "companyName" FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = $1`;
    const jobResult = await db.query(jobQuery, [jobId]);
    const updatedJob = jobResult.rows[0];
    updatedJob.userHasApplied = true;
    res.status(201).json({ 
        status: 'success', 
        message: 'Application submitted successfully!', 
        data: { job: updatedJob }
    });
});