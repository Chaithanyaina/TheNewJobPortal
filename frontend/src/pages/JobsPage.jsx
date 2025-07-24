import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import Spinner from '../components/common/Spinner';
import { MapPin, Briefcase, Clock, Building2 } from 'lucide-react'; // Import Building2 icon
import { formatDistanceToNow } from 'date-fns';

// Reusable JobCard Component - Simplified to remove the logo
const JobCard = ({ job }) => (
    <Link to={`/job/${job.id}`} className="block bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start space-x-4">
            {/* Replaced the CompanyLogo component with a simple icon */}
            <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                <Building2 className="text-text-secondary" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-primary">{job.title}</h3>
                <p className="text-text-secondary">{job.companyName}</p>
            </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
            <span className="flex items-center gap-2"><MapPin size={16} />{job.location}</span>
            <span className="flex items-center gap-2"><Briefcase size={16} />{job.type}</span>
            <span className="flex items-center gap-2"><Clock size={16} />{formatDistanceToNow(new Date(job.posted_at))} ago</span>
        </div>
    </Link>
);

const JobsPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q');

  const fetchJobs = async () => {
    const { data } = await axiosInstance.get('/jobs', { params: { q } });
    return data.data.jobs;
  };

  const { data: jobs, isLoading, error } = useQuery({ 
      queryKey: ['jobs', q], 
      queryFn: fetchJobs 
    });

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{q ? `Search results for "${q}"` : 'All Available Jobs'}</h1>
        
        {isLoading && <Spinner />}
        
        {error && <p className="text-red-500 text-center">Error loading jobs.</p>}
        
        {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs?.map(job => <JobCard key={job.id} job={job} />)}
            </div>
        )}

        {!isLoading && jobs?.length === 0 && <p className="text-center text-text-secondary">No jobs found.</p>}
    </div>
  );
};

export default JobsPage;