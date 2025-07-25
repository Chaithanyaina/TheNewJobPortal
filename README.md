# 🚀 AI-Powered Job Portal (PERN Stack)

A full-stack, production-grade job portal application built with the PERN stack (PostgreSQL, Express.js, React.js, Node.js). This platform connects job seekers with employers, enhanced with AI-powered tools to streamline the application and recruitment process.

**Live Demo:** [**https://the-new-job-portal.vercel.app/**](https://the-new-job-portal.vercel.app/)

![Job Portal Screenshot](https://i.imgur.com/3QZ3A5w.png) 
*(**Note:** You can replace this with a screenshot of your own homepage!)*

---

## ✨ Core Features

### For Job Seekers
* **Secure Authentication:** Seamless signup and login with JWT-based authentication.
* **Mandatory Resume Upload:** Users must upload a resume via Cloudinary upon signup.
* **Advanced Job Search:**
    * Dynamic full-text search for job titles and descriptions.
    * Multi-faceted filtering by location, job type, and minimum salary.
    * Server-side pagination to efficiently handle large datasets.
* **Application Tracking:** A dedicated "My Applications" dashboard to view the status of all submitted applications (`Applied`, `Viewed`, `Interviewing`, `Rejected`, etc.).
* **AI Resume Analyzer:** An integrated tool powered by the Google Gemini API that provides users with actionable feedback on their resumes, with the option to analyze it against a specific job description.
* **Profile Management:** Users can create and update their professional profile, including their headline, summary, and skills.

### For Employers
* **Secure Authentication:** Dedicated signup and login for recruiters.
* **Company Profile:** Recruiters can manage their company name, description, and website.
* **Job Management:** Full CRUD (Create, Read, Update, Delete) functionality for job postings.
* **Applicant Tracking System (ATS):**
    * A private dashboard to view all jobs posted by the employer.
    * View a list of all candidates who have applied for a specific job.
    * Securely view applicant resumes.
    * Update application statuses (e.g., from "Applied" to "Interviewing").
* **Real-time Notifications:** Receive notifications for new applicants.

---

## 🛠️ Tech Stack

| Category              | Technology                                                                                                                                                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **State Management** | ![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white) ![Zustand](https://img.shields.io/badge/zustand-%23743a0e.svg?style=for-the-badge)                                                                                                                                         |
| **Backend** | ![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=white)                                                                                                                  |
| **Database** | ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)                                                                                                                                                                                                                          |
| **Cloud & DevOps** | ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white) ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)       |
| **AI Integration** | ![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E77F7?style=for-the-badge)                                                                                                                                                                                                                                                     |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
* Node.js (v18 or later)
* npm
* PostgreSQL

### 1. Clone the repository
```sh
git clone [https://github.com/your-username/your-repo.git](https://github.com/your-username/your-repo.git)
cd your-repo
```

### 2. Backend Setup
```sh
# Navigate to the backend folder
cd job-portal-backend

# Install NPM packages
npm install

# Create your environment variables file
cp .env.example .env 
```
Next, open the `.env` file and fill in your credentials for the PostgreSQL database, JWT secret, Cloudinary, and Gemini API.

```sh
# Connect to PostgreSQL and run the schema script
# Make sure your database is created first
psql -U your_postgres_user -d your_db_name -f db/init.sql

# Start the server
npm run dev
```
The backend will be running on `http://localhost:5000`.

### 3. Frontend Setup
```sh
# Navigate to the frontend folder (from the root directory)
cd job-portal-frontend

# Install NPM packages
npm install

# Create your environment variables file
# (You can create this file manually)
```
Create a `.env` file in the `job-portal-frontend` directory and add the following:
```
VITE_API_URL=http://localhost:5000/api/v1
```
```sh
# Start the client
npm run dev
```
The frontend will be running on `http://localhost:5173`.

---

## ⚙️ Environment Variables

### Backend (`job-portal-backend/.env`)
```
PORT=5000
NODE_ENV=development

# Replace with your PostgreSQL connection string
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE

# Use a long, random string
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary credentials from your dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`job-portal-frontend/.env`)
```
# The URL of your running backend API
VITE_API_URL=http://localhost:5000/api/v1
```
