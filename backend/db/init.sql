-- Drop existing tables and types to start fresh
DROP TABLE IF EXISTS applications, job_seeker_profiles, jobs, companies, users CASCADE;
DROP TYPE IF EXISTS user_role, application_status, job_type;

-- Create custom types
CREATE TYPE user_role AS ENUM ('Job Seeker', 'Employer', 'Admin');
CREATE TYPE application_status AS ENUM ('Applied', 'Viewed', 'Interviewing', 'Offered', 'Rejected');
CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Internship');

---
-- TABLE CREATION (IN CORRECT ORDER)
---

-- 1. Users table (no dependencies)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Companies table (depends on users)
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Jobs table (depends on companies) -- THIS WAS THE MISSING TABLE
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT,
    qualifications TEXT,
    location VARCHAR(255),
    type job_type,
    -- ADD THESE TWO LINES --
    salary_min NUMERIC(10, 2),
    salary_max NUMERIC(10, 2),
    -------------------------
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tsv tsvector -- Ensure this line is present
);

-- 4. Job Seeker Profiles table (depends on users)
CREATE TABLE job_seeker_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    summary TEXT,
    resume_url VARCHAR(255),
    skills TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Applications table (depends on users and jobs)
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status application_status DEFAULT 'Applied',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id) -- A user can only apply to a job once
);

---
-- INDEXES AND TRIGGERS
---

-- Create indexes for faster queries
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);

-- Enable full-text search on jobs
ALTER TABLE jobs ADD COLUMN tsv tsvector;

CREATE OR REPLACE FUNCTION update_jobs_tsv()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tsv :=
    to_tsvector('english', COALESCE(NEW.title, '')) ||
    to_tsvector('english', COALESCE(NEW.description, '')) ||
    to_tsvector('english', COALESCE(NEW.qualifications, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_tsv_update
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION update_jobs_tsv();

CREATE INDEX jobs_tsv_idx ON jobs USING GIN(tsv);