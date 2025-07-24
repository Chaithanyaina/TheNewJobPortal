import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { Download, ArrowLeft, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ApplicantsPage = () => {
    const { jobId } = useParams();
    const queryClient = useQueryClient();

    const { data: applicants, isLoading, error } = useQuery({
        queryKey: ['applicants', jobId],
        queryFn: () => axiosInstance.get(`/employer/jobs/${jobId}/applicants`).then(res => res.data.data.applicants),
    });

    const statusMutation = useMutation({
        mutationFn: ({ applicationId, status }) => axiosInstance.patch(`/employer/applications/${applicationId}/status`, { status }),
        onSuccess: () => {
            toast.success("Applicant status updated!");
            queryClient.invalidateQueries({ queryKey: ['applicants', jobId] });
            queryClient.invalidateQueries({ queryKey: ['myApplications'] });
        },
        onError: () => toast.error("Failed to update status."),
    });

    const handleStatusChange = (applicationId, status) => {
        statusMutation.mutate({ applicationId, status });
    };

    if (isLoading) return <div className="py-20"><Spinner /></div>;
    if (error) return <p className="text-center text-red-500 py-20">Could not fetch applicants. Please check your authorization and try again.</p>;

    return (
        <div className="container mx-auto px-4 py-12">
            <Link to="/employer/dashboard" className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:underline">
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold mb-8">Applicants</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {applicants && applicants.length > 0 ? applicants.map(app => (
                        <div key={app.applicationId} className="p-6">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <p className="font-bold text-lg">{app.first_name} {app.last_name}</p>
                                    <p className="text-sm text-text-secondary flex items-center gap-2 mt-1"><Mail size={14}/> {app.email}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-1"><Clock size={14}/> Applied: {format(new Date(app.applied_at), 'dd MMM, yyyy')}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    {app.resume_url ? (
                                        <a href={app.resume_url} target="_blank" rel="noopener noreferrer" 
                                            className="bg-gray-200 text-gray-800 px-3 py-2 text-sm rounded-md hover:bg-gray-300 flex items-center gap-2 font-semibold">
                                            <Download size={16}/> View Resume
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-500">No Resume</span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                <span className="text-sm font-medium">Status: <span className="font-bold">{app.status}</span></span>
                                <div className="flex items-center gap-2">
                                     <button onClick={() => handleStatusChange(app.applicationId, 'Interviewing')} className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600" disabled={statusMutation.isPending}>Set to Interview</button>
                                    <button onClick={() => handleStatusChange(app.applicationId, 'Offered')} className="bg-green-500 text-white px-3 py-1 text-xs rounded hover:bg-green-600" disabled={statusMutation.isPending}>Accept</button>
                                    <button onClick={() => handleStatusChange(app.applicationId, 'Rejected')} className="bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600" disabled={statusMutation.isPending}>Reject</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                         <p className="p-6 text-center text-text-secondary">No applicants for this job yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ApplicantsPage;