import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import { MapPin, Briefcase, Clock, Building2, SlidersHorizontal, X, IndianRupee } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: 'easeOut' },
  }),
};

const JobCard = ({ job, index }) => (
    <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        className="bg-surface border border-border rounded-lg p-6 hover:shadow-xl transition-shadow duration-300"
    >
        <Link to={`/job/${job.id}`} className="block">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Building2 className="text-text-secondary" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-primary">{job.title}</h3>
                    <p className="text-text-secondary">{job.companyName}</p>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-secondary">
                <span className="flex items-center gap-2"><MapPin size={16} />{job.location}</span>
                <span className="flex items-center gap-2"><Briefcase size={16} />{job.type}</span>
                {job.salary_min && (
                     <span className="flex items-center gap-1 font-medium text-green-600"><IndianRupee size={16} />{Number(job.salary_min).toLocaleString()}</span>
                )}
                <span className="flex items-center gap-2"><Clock size={16} />{formatDistanceToNow(new Date(job.posted_at))} ago</span>
            </div>
        </Link>
    </motion.div>
);

const JobsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const q = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const minSalary = searchParams.get('minSalary') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    const { data, isLoading, error } = useQuery({ 
        queryKey: ['jobs', { q, location, type, minSalary, page }], 
        queryFn: () => {
            const params = new URLSearchParams({ q, location, type, minSalary, page });
            return axiosInstance.get('/jobs', { params }).then(res => res.data.data);
        },
        keepPreviousData: true,
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (value) {
                newParams.set(name, value);
            } else {
                newParams.delete(name);
            }
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-8"
        >
            <div className="bg-surface p-6 rounded-lg shadow-sm border border-border mb-8 animate-fade-in">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><SlidersHorizontal size={20}/> Find Your Next Job</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleFilterChange(e) }}
                        placeholder="Search by title or keyword..."
                        className="lg:col-span-2 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select name="location" value={location} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">All Locations</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Pune">Pune</option>
                        <option value="Remote">Remote</option>
                    </select>
                     <select name="type" value={type} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">All Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                    {/* --- NEW SALARY FILTER DROPDOWN --- */}
                    <select name="minSalary" value={minSalary} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Any Salary</option>
                        <option value="500000">₹5,00,000+</option>
                        <option value="1000000">₹10,00,000+</option>
                        <option value="1500000">₹15,00,000+</option>
                        <option value="2000000">₹20,00,000+</option>
                        <option value="2500000">₹25,00,000+</option>
                    </select>
                </div>
                {(q || location || type || minSalary) && (
                    <div className="mt-4 text-right">
                        <button 
                            onClick={handleResetFilters} 
                            className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-semibold"
                        >
                            <X size={16}/>
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
            
            {isLoading && <Spinner />}
            {error && <p className="text-red-500 text-center">Error loading jobs.</p>}
            
            {!isLoading && !error && (
                <>
                    <AnimatePresence>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data?.jobs?.map((job, index) => <JobCard key={job.id} job={job} index={index} />)}
                        </div>
                    </AnimatePresence>

                    {!data?.jobs?.length && (
                        <div className="text-center py-16 bg-surface rounded-lg">
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
        </motion.div>
    );
};
export default JobsPage;