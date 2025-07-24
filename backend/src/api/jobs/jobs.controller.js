import db from '../../config/db.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

export const getAllJobs = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  let query = `
    SELECT 
        j.id, 
        j.title, 
        j.location, 
        j.type, 
        j.posted_at,
        c.name AS "companyName"
    FROM jobs j 
    JOIN companies c ON j.company_id = c.id
    WHERE j.is_active = TRUE
  `;
  const params = [];
  if (q) {
    query += ` AND j.tsv @@ to_tsquery('english', $1)`;
    // Sanitize the query for to_tsquery: 'word1 & word2'
    params.push(q.trim().replace(/\s+/g, ' & '));
  }
  query += ' ORDER BY j.posted_at DESC';
  
  const { rows } = await db.query(query, params);
  res.status(200).json({ status: 'success', results: rows.length, data: { jobs: rows } });
});

export const getJobById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const jobQuery = `
      SELECT j.*, c.name AS "companyName"
      FROM jobs j JOIN companies c ON j.company_id = c.id
      WHERE j.id = $1 AND j.is_active = TRUE
    `;
    const jobResult = await db.query(jobQuery, [id]);
    
    if (jobResult.rows.length === 0) {
        return next(new AppError('No job found with that ID', 404));
    }
    const job = jobResult.rows[0];

    job.userHasApplied = false;
    if (userId) {
        const applicationQuery = 'SELECT id FROM applications WHERE user_id = $1 AND job_id = $2';
        const applicationResult = await db.query(applicationQuery, [userId, id]);
        if (applicationResult.rows.length > 0) {
            job.userHasApplied = true;
        }
    }
    res.status(200).json({ status: 'success', data: { job } });
});

export const createJob = catchAsync(async (req, res, next) => {
    const { title, description, responsibilities, qualifications, location, type } = req.body;
    const employerId = req.user.id;

    const companyResult = await db.query('SELECT id FROM companies WHERE user_id = $1', [employerId]);
    if (companyResult.rows.length === 0) return next(new AppError('Employer does not have a company profile.', 400));
    const companyId = companyResult.rows[0].id;

    const newJobQuery = `
        INSERT INTO jobs (company_id, title, description, responsibilities, qualifications, location, type)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const { rows } = await db.query(newJobQuery, [companyId, title, description, responsibilities, qualifications, location, type]);
    res.status(201).json({ status: 'success', data: { job: rows[0] } });
});

export const applyToJob = catchAsync(async (req, res, next) => {
    const { id: jobId } = req.params;
    const seekerId = req.user.id;

    const profileResult = await db.query('SELECT resume_url FROM job_seeker_profiles WHERE user_id = $1', [seekerId]);
    if (!profileResult.rows[0]?.resume_url) {
        return next(new AppError('You must upload a resume to your profile before applying.', 400));
    }

    try {
        await db.query( 'INSERT INTO applications (user_id, job_id) VALUES ($1, $2)', [seekerId, jobId]);
    } catch (err) {
        if (err.code === '23505') {
            return next(new AppError('You have already applied to this job.', 409));
        }
        throw err;
    }

    const jobQuery = `
      SELECT j.*, c.name AS "companyName"
      FROM jobs j JOIN companies c ON j.company_id = c.id
      WHERE j.id = $1
    `;
    const jobResult = await db.query(jobQuery, [jobId]);
    const updatedJob = jobResult.rows[0];
    updatedJob.userHasApplied = true;

    res.status(201).json({ 
        status: 'success', 
        message: 'Application submitted successfully!', 
        data: { job: updatedJob }
    });
});