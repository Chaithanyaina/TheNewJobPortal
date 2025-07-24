import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import { Mail, Edit, Link as LinkIcon, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useAuth();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: () => axiosInstance.get('/profiles/me').then(res => res.data.data.profile),
    enabled: !!user,
  });

  if (isLoading) return <div className="py-20"><Spinner /></div>;
  if (error) return <p className="text-center text-red-500 py-20">Failed to load profile.</p>;
  if (!profile) return <p className="text-center py-20">No profile data found.</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">{profile.first_name} {profile.last_name}</h1>
                <p className="text-lg text-text-secondary flex items-center gap-2 mt-1"><Mail size={16} /> {profile.email}</p>
            </div>
          <Link to="/profile/edit" className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline flex-shrink-0">
            <Edit size={16} /> Edit Profile
          </Link>
        </div>
        
        <div className="border-t pt-6">
          {profile.role === 'Job Seeker' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-secondary">Headline</h3>
                <p className="text-xl">{profile.headline || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-secondary">Summary</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.summary || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-secondary">Skills</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.skills?.length > 0 ? (
                    profile.skills.map((skill, i) => <span key={i} className="bg-secondary text-primary text-sm font-medium px-3 py-1 rounded-full">{skill}</span>)
                  ) : <p className="text-gray-500">No skills listed.</p>}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-secondary">Resume</h3>
                {profile.resume_url ? (
                    <a href={profile.resume_url} target='_blank' rel='noopener noreferrer' className="inline-flex items-center gap-2 text-primary hover:underline mt-2">
                        <FileText size={16}/> View Uploaded Resume
                    </a>
                ) : <p className="text-gray-500">No resume uploaded.</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
              <div>
                <h3 className="text-lg font-semibold text-text-secondary">Company Description</h3>
                <p>{profile.description || 'Not provided'}</p>
              </div>
               <div className="flex items-center gap-4">
                <LinkIcon className="h-5 w-5 text-primary" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.website || 'No website listed'}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;