import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const JobCard = ({ job }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start space-x-4">
        <img src={job.companyLogo || 'https://via.placeholder.com/50'} alt={`${job.companyName} logo`} className="w-12 h-12 rounded-md object-contain" />
        <div className="flex-1">
          <Link to={`/job/${job.id}`} className="text-lg font-semibold text-primary hover:underline">
            {job.title}
          </Link>
          <p className="text-text-secondary">{job.companyName}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase size={16} />
          <span>{job.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{formatDistanceToNow(new Date(job.postedAt))} ago</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-text-secondary line-clamp-2">
        {job.description}
      </p>
    </div>
  );
};

export default JobCard;