import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import JobsPage from '../pages/JobsPage';
import JobDetailsPage from '../pages/JobDetailsPage';
import ProfilePage from '../pages/ProfilePage';
import EditProfilePage from '../pages/EditProfilePage';
import MyApplicationsPage from '../pages/MyApplicationsPage';
import PostJobPage from '../pages/employer/PostJobPage';
import EmployerDashboard from '../pages/employer/EmployerDashboard';
import ApplicantsPage from '../pages/employer/ApplicantsPage';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '../pages/NotFoundPage';
import ResumeAnalyzerPage from '../pages/ResumeAnalyzerPage'; // <-- IMPORT

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/jobs" element={<JobsPage />} />
    <Route path="/job/:id" element={<JobDetailsPage />} />

    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
    <Route
      path="/my-applications"
      element={
        <ProtectedRoute allowedRoles={['Job Seeker']}>
          <MyApplicationsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tools/resume-analyzer"
      element={
        <ProtectedRoute allowedRoles={['Job Seeker']}>
          <ResumeAnalyzerPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/post-job"
      element={
        <ProtectedRoute allowedRoles={['Employer']}>
          <PostJobPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employer/dashboard"
      element={
        <ProtectedRoute allowedRoles={['Employer']}>
          <EmployerDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employer/jobs/:jobId/applicants"
      element={
        <ProtectedRoute allowedRoles={['Employer']}>
          <ApplicantsPage />
        </ProtectedRoute>
      }
    />

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
