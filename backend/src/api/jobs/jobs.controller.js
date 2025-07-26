import db from '../../config/db.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import axios from 'axios';
import PDFParser from "pdf2json";
import { scoreResumePdfWithGemini } from '../../services/ai.service.js';

const processApplicationScreening = async (applicationId, jobId, seekerId) => {
    try {
        console.log(`Starting AI screening for application ID: ${applicationId}`);

        const jobResult = await db.query('SELECT description FROM jobs WHERE id = $1', [jobId]);
        const profileResult = await db.query('SELECT resume_url FROM job_seeker_profiles WHERE user_id = $1', [seekerId]);
        const jobDescription = jobResult.rows[0]?.description;
        const resumeUrl = profileResult.rows[0]?.resume_url;

        if (!jobDescription || !resumeUrl) {
            throw new Error('Job or resume not found for screening.');
        }

        const score = await scoreResumePdfWithGemini(resumeUrl, jobDescription);
        console.log(`AI screening complete for application ID: ${applicationId}. Score: ${score}`);

        const finalStatus = score >= 85 ? 'Applied' : 'Rejected';
        await db.query('UPDATE applications SET status = $1 WHERE id = $2', [finalStatus, applicationId]);
        console.log(`Application ID: ${applicationId} status updated to ${finalStatus}`);

    } catch (error) {
        console.error(`Failed AI screening for application ID: ${applicationId}`, error);
        await db.query('UPDATE applications SET status = $1 WHERE id = $2', ['Rejected', applicationId]);
    }
};

export const applyToJob = catchAsync(async (req, res, next) => {
    const { id: jobId } = req.params;
    const seekerId = req.user.id;

    const profileResult = await db.query('SELECT resume_url FROM job_seeker_profiles WHERE user_id = $1', [seekerId]);
    if (!profileResult.rows[0]?.resume_url) {
        return next(new AppError('You must have a resume on your profile to apply.', 400));
    }
    const existingApplication = await db.query('SELECT id FROM applications WHERE user_id = $1 AND job_id = $2', [seekerId, jobId]);
    if (existingApplication.rows.length > 0) {
        return next(new AppError('You have already applied to this job.', 409));
    }

    const newApplicationResult = await db.query(
        'INSERT INTO applications (user_id, job_id, status) VALUES ($1, $2, $3) RETURNING id',
        [seekerId, jobId, 'Screening']
    );
    const newApplicationId = newApplicationResult.rows[0].id;

    processApplicationScreening(newApplicationId, jobId, seekerId);

    const jobQuery = `SELECT j.*, c.name AS "companyName" FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = $1`;
    const jobResult = await db.query(jobQuery, [jobId]);
    const updatedJob = jobResult.rows[0];
    updatedJob.userHasApplied = true;

    res.status(200).json({ 
        status: 'success', 
        message: 'Your application has been submitted and is being screened by our AI.', 
        data: { job: updatedJob }
    });
});
export const getAllJobs = catchAsync(async (req, res, next) => {
    const { q, location, type, minSalary, page = 1, limit = 9 } = req.query;

    let baseQuery = `
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.is_active = TRUE
    `;
    const params = [];
    let paramIndex = 1;

    if (q) {
        const searchTerms = q.trim().split(/\s+/);
        const formattedQuery = searchTerms.map((term, index) => index === searchTerms.length - 1 ? term + ':*' : term).join(' & ');
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
    // THE FIX IS HERE: Add the salary filter to the query if it's provided
    if (minSalary) {
        baseQuery += ` AND j.salary_min >= $${paramIndex++}`;
        params.push(minSalary);
    }

    // --- First, get the total count for pagination ---
    const countQuery = `SELECT COUNT(*) ${baseQuery}`;
    const countResult = await db.query(countQuery, params);
    const totalJobs = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalJobs / limit);

    // --- Second, get the job data with pagination ---
    const offset = (page - 1) * limit;
    const dataQuery = `
        SELECT j.id, j.title, j.location, j.type, j.posted_at, j.salary_min, j.salary_max, c.name AS "companyName"
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
    const { title, description, location, type, salaryMin, salaryMax, responsibilities, qualifications } = req.body;
    const employerId = req.user.id;
    const companyResult = await db.query('SELECT id FROM companies WHERE user_id = $1', [employerId]);
    if (companyResult.rows.length === 0) return next(new AppError('Employer does not have a company profile.', 400));
    const companyId = companyResult.rows[0].id;
    const newJobQuery = `INSERT INTO jobs (company_id, title, description, location, type, salary_min, salary_max, responsibilities, qualifications) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
    const { rows } = await db.query(newJobQuery, [companyId, title, description, location, type, salaryMin || null, salaryMax || null, responsibilities, qualifications]);
    res.status(201).json({ status: 'success', data: { job: rows[0] } });
});




// --- NEW FUNCTION: To update a job posting ---
export const updateJob = catchAsync(async (req, res, next) => {
    const { id: jobId } = req.params;
    const employerId = req.user.id;
    const { title, description, location, type, salaryMin, salaryMax, isActive } = req.body;

    // First, verify the employer owns this job
    const ownershipCheck = await db.query(
        'SELECT j.id FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = $1 AND c.user_id = $2',
        [jobId, employerId]
    );
    if (ownershipCheck.rows.length === 0) {
        return next(new AppError('You are not authorized to edit this job.', 403));
    }

    const query = `
        UPDATE jobs 
        SET title = $1, description = $2, location = $3, type = $4, salary_min = $5, salary_max = $6, is_active = $7
        WHERE id = $8 RETURNING *
    `;
    const { rows } = await db.query(query, [title, description, location, type, salaryMin, salaryMax, isActive, jobId]);

    res.status(200).json({ status: 'success', data: { job: rows[0] } });
});

// --- NEW FUNCTION: To delete a job posting ---
export const deleteJob = catchAsync(async (req, res, next) => {
    const { id: jobId } = req.params;
    const employerId = req.user.id;

    // Verify ownership before deleting
    const ownershipCheck = await db.query(
        'SELECT j.id FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = $1 AND c.user_id = $2',
        [jobId, employerId]
    );
    if (ownershipCheck.rows.length === 0) {
        return next(new AppError('You are not authorized to delete this job.', 403));
    }
    
    // Deleting a job will automatically cascade and delete all related applications
    await db.query('DELETE FROM jobs WHERE id = $1', [jobId]);

    res.status(204).json({ status: 'success', data: null });
});