import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Spinner from '../../components/common/Spinner';
import { Briefcase, Users, PlusCircle, MapPin, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EmployerDashboard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['myEmployerJobs'],
        queryFn: () => axiosInstance.get('/employer/jobs').then(res => res.data.data.jobs),
    });

    const deleteMutation = useMutation({
        mutationFn: (jobId) => axiosInstance.delete(`/employer/jobs/${jobId}`),
        onSuccess: () => {
            toast.success("Job deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ['myEmployerJobs'] });
        },
        onError: () => toast.error("Failed to delete job."),
    });

    const handleDelete = (jobId, jobTitle) => {
        if (window.confirm(`Are you sure you want to delete the job posting for "${jobTitle}"? This action cannot be undone.`)) {
            deleteMutation.mutate(jobId);
        }
    };

    if (isLoading) return <div className="py-20"><Spinner /></div>;
    if (error) return <p className="text-center text-red-500">Could not fetch jobs.</p>;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Job Postings</h1>
                <Link to="/post-job" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center gap-2">
                    <PlusCircle size={20} /> Post New Job
                </Link>
            </div>
            <div className="bg-surface p-6 rounded-lg shadow-md border border-border">
                {jobs && jobs.length > 0 ? (
                    <div className="space-y-4">
                        {jobs.map(job => (
                            <div key={job.id} className="p-4 border border-border rounded-lg hover:bg-gray-50/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Link to={`/employer/jobs/${job.id}/applicants`} className="text-xl font-semibold text-primary hover:underline">{job.title}</Link>
                                        <p className="text-text-secondary flex items-center gap-2 mt-1"><MapPin size={16}/> {job.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                            {job.is_active ? 'Active' : 'Archived'}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-2">Posted {format(new Date(job.created_at), 'dd MMM, yyyy')}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
                                    <Link to={`/employer/jobs/${job.id}/applicants`} className="flex items-center gap-2 font-bold hover:text-primary"><Users size={16}/> {job.applicantCount} Applicants</Link>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => navigate(`/employer/jobs/${job.id}/edit`)} className="flex items-center gap-2 text-blue-600 hover:underline font-semibold"><Edit size={14}/> Edit</button>
                                        <button onClick={() => handleDelete(job.id, job.title)} className="flex items-center gap-2 text-red-600 hover:underline font-semibold"><Trash2 size={14}/> Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10"><p className="text-text-secondary">You have not posted any jobs yet.</p></div>
                )}
            </div>
        </div>
    );
};
export default EmployerDashboard;