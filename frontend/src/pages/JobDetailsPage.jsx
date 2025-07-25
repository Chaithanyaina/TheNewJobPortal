import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { MapPin, Briefcase, Clock, ArrowLeft, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

const JobDetailsPage = () => {
    const { id } = useParams();
    const { isAuthenticated, role } = useAuth();

    const { data: job, isLoading } = useQuery({
        queryKey: ['job', id],
        queryFn: () => axiosInstance.get(`/jobs/${id}`).then(res => res.data.data.job),
        enabled: !!id,
    });

    const applyMutation = useMutation({
        mutationFn: () => axiosInstance.post(`/jobs/${id}/apply`),
        onSuccess: () => {
            toast.success('Successfully applied for the job!');
            window.location.reload(); // Ensure UI updates
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to apply.');
        },
    });

    if (isLoading) return <div className="py-20"><Spinner /></div>;
    if (!job) return <p className="text-center py-20">Job not found.</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/jobs" className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:underline">
                <ArrowLeft size={18} /> Back to Jobs
            </Link>

            <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">{job.title}</h1>
                        <p className="text-xl text-text-secondary mt-1">{job.companyName}</p>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-text-secondary border-b pb-6">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} /><span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Briefcase size={16} /><span>{job.type}</span>
                    </div>

                    {/* --- Salary Display --- */}
                    {job.salary_min && (
                        <div className="flex items-center gap-1 font-medium">
                            <IndianRupee size={16} />
                            {Number(job.salary_min).toLocaleString()} - {Number(job.salary_max).toLocaleString()} per year
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Clock size={16} /><span>Posted on {format(new Date(job.posted_at), 'MMMM d, yyyy')}</span>
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-3">Job Description</h2>
                    <p className="text-text-secondary whitespace-pre-wrap">{job.description}</p>
                </div>

                <div className="mt-8">
                    {isAuthenticated && role === 'Job Seeker' && (
                        job.userHasApplied ? (
                            <button className="w-full bg-gray-300 text-gray-600 py-3 rounded-md font-semibold cursor-not-allowed" disabled>
                                ✓ Applied
                            </button>
                        ) : (
                            <button
                                onClick={() => applyMutation.mutate()}
                                disabled={applyMutation.isPending}
                                className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-dark disabled:bg-gray-400"
                            >
                                {applyMutation.isPending ? 'Applying...' : 'Apply Now'}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetailsPage;
