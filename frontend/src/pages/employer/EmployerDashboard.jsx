import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Spinner from '../../components/common/Spinner';
import { Briefcase, Users, PlusCircle, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const EmployerDashboard = () => {
    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['myEmployerJobs'],
        queryFn: () => axiosInstance.get('/employer/jobs').then(res => res.data.data.jobs),
    });

    if (isLoading) return <div className="py-20"><Spinner /></div>;
    if (error) return <p className="text-center text-red-500">Could not fetch jobs. Please try again later.</p>;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Job Postings</h1>
                <Link to="/post-job" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark flex items-center gap-2">
                    <PlusCircle size={20} /> Post New Job
                </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {jobs && jobs.length > 0 ? (
                    <div className="space-y-4">
                        {jobs.map(job => (
                            <Link key={job.id} to={`/employer/jobs/${job.id}/applicants`} className="block p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-semibold text-primary">{job.title}</h2>
                                        <p className="text-text-secondary flex items-center gap-2 mt-1"><MapPin size={16}/> {job.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {job.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-2">Posted {format(new Date(job.created_at), 'dd MMM, yyyy')}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex items-center text-sm">
                                    <span className="flex items-center gap-2 font-bold"><Users size={16}/> {job.applicantCount} Applicants</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-text-secondary">You have not posted any jobs yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default EmployerDashboard;