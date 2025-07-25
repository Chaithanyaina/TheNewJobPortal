import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import { MapPin, Briefcase, Clock, Building2, SlidersHorizontal, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Simplified JobCard component
const JobCard = ({ job }) => (
    <Link to={`/job/${job.id}`} className="block bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start space-x-4">
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
    const [searchParams, setSearchParams] = useSearchParams();

    const q = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    const { data, isLoading, error } = useQuery({
        queryKey: ['jobs', { q, location, type, page }],
        queryFn: () => {
            const params = new URLSearchParams({ q, location, type, page });
            return axiosInstance.get('/jobs', { params }).then(res => res.data.data);
        },
        keepPreviousData: true,
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set(name, value);
            newParams.set('page', '1');
            return newParams;
        });
    };

    const handlePageChange = (newPage) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', newPage.toString());
            return newParams;
        });
    };

    const handleResetFilters = () => {
        setSearchParams({});
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <SlidersHorizontal size={20} /> Find Your Next Job
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFilterChange(e);
                        }}
                        placeholder="Search by title or keyword..."
                        className="md:col-span-2 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                        name="location"
                        value={location}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Locations</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Pune">Pune</option>
                        <option value="Remote">Remote</option>
                    </select>
                    <select
                        name="type"
                        value={type}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>

                {(q || location || type) && (
                    <div className="mt-4 text-right">
                        <button
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-semibold"
                        >
                            <X size={16} />
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            {isLoading && <Spinner />}
            {error && <p className="text-red-500 text-center">Error loading jobs.</p>}

            {!isLoading && !error && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.jobs?.map(job => <JobCard key={job.id} job={job} />)}
                    </div>

                    {!data?.jobs?.length && (
                        <div className="text-center py-16 bg-white rounded-lg">
                            <h3 className="text-xl font-semibold">No Jobs Found</h3>
                            <p className="text-text-secondary mt-2">Try adjusting your search or filters.</p>
                        </div>
                    )}

                    <Pagination
                        currentPage={data?.pagination?.currentPage || 1}
                        totalPages={data?.pagination?.totalPages || 1}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

export default JobsPage;
