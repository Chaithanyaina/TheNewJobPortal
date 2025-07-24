import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Spinner from '../components/common/Spinner';
import { format } from 'date-fns';

const statusStyles = {
    Applied: 'bg-blue-100 text-blue-800',
    Viewed: 'bg-purple-100 text-purple-800',
    Interviewing: 'bg-yellow-100 text-yellow-800',
    Rejected: 'bg-red-100 text-red-800',
    Offered: 'bg-green-100 text-green-800',
};

const MyApplicationsPage = () => {
    const { data: applications, isLoading } = useQuery({
        queryKey: ['myApplications'],
        queryFn: () => axiosInstance.get('/applications').then(res => res.data.data.applications)
    });

    if (isLoading) return <div className="py-20"><Spinner /></div>;

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">My Applications</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {applications?.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {applications.map(app => (
                            <li key={app.applicationId} className="py-4 flex justify-between items-center">
                                <div>
                                    <Link to={`/job/${app.jobId}`} className="text-lg font-semibold text-primary hover:underline">{app.title}</Link>
                                    <p className="text-text-secondary">{app.companyName} - {app.location}</p>
                                    <p className="text-sm text-gray-500">Applied on: {format(new Date(app.applied_at), 'MMMM d, yyyy')}</p>
                                </div>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[app.status]}`}>
                                    {app.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You haven't applied to any jobs yet.</p>
                )}
            </div>
        </div>
    );
};

export default MyApplicationsPage;