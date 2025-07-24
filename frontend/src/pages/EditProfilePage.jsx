import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { Paperclip } from 'lucide-react';

const EditProfilePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, setUser } = useAuth();

    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['myProfile', user?.id],
        queryFn: () => axiosInstance.get('/profiles/me').then(res => res.data.data.profile),
        enabled: !!user,
    });

    const methods = useForm();
    
    useEffect(() => {
        if (profile) {
            methods.reset({
                firstName: profile.first_name || '',
                lastName: profile.last_name || '',
                headline: profile.headline || '',
                summary: profile.summary || '',
                skills: profile.skills?.join(', ') || '',
                companyName: profile.name || '',
                companyDescription: profile.description || '',
                website: profile.website || '',
            });
        }
    }, [profile, methods.reset]);

    const mutation = useMutation({
        mutationFn: (formData) => axiosInstance.put('/profiles/me', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        onSuccess: ({ data }) => {
            toast.success('Profile updated successfully!');
            setUser(data.data.user);
            queryClient.setQueryData(['myProfile', user.id], data.data.profile);
            navigate('/profile');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Update failed.'),
    });

    const onSubmit = (data) => {
        const formData = new FormData();
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);

        if (user?.role === 'Job Seeker') {
            formData.append('headline', data.headline);
            formData.append('summary', data.summary);
            formData.append('skills', data.skills);
            if (data.resume?.[0]) {
                formData.append('resume', data.resume[0]);
            }
        } else if (user?.role === 'Employer') {
            formData.append('companyName', data.companyName);
            formData.append('companyDescription', data.companyDescription);
            formData.append('website', data.website);
        }
        mutation.mutate(formData);
    };

    if (isProfileLoading) return <div className="py-20"><Spinner /></div>;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto p-8 border rounded-lg shadow-lg bg-white">
                <h1 className="text-3xl font-bold mb-6 text-center">Edit Profile</h1>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} noValidate className="space-y-6">
                        <fieldset>
                           <legend className="text-lg font-semibold mb-2 border-b pb-1">Personal Info</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                <Input name="firstName" label="First Name" />
                                <Input name="lastName" label="Last Name" />
                            </div>
                        </fieldset>

                        {user?.role === 'Job Seeker' && (
                            <fieldset>
                                <legend className="text-lg font-semibold mb-4 border-b pb-2">Professional Info</legend>
                                <div className="space-y-4">
                                    <Input name="headline" label="Headline" placeholder="e.g., Aspiring Full Stack Developer"/>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Summary</label>
                                        <textarea {...methods.register('summary')} rows="4" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                                    </div>
                                    <Input name="skills" label="Skills" placeholder="e.g., React, Node.js (comma-separated)"/>
                                </div>
                                <legend className="text-lg font-semibold my-4 border-b pb-2">Resume</legend>
                                {profile?.resume_url ? (
                                    <div className="p-3 bg-secondary rounded-md flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2"><Paperclip size={16} className="text-primary"/><span className="text-sm font-medium">A resume is on file.</span></div>
                                        <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-semibold hover:underline">View Current</a>
                                    </div>
                                ) : <p className="text-sm text-red-500 mb-2">No resume uploaded. Please upload one.</p>}
                                <input type="file" accept="application/pdf" {...methods.register('resume')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                            </fieldset>
                        )}

                        {user?.role === 'Employer' && (
                            <fieldset>
                                <legend className="text-lg font-semibold mb-2 border-b pb-1">Company Info</legend>
                                <Input name="companyName" label="Company Name" placeholder="Your Company LLC"/>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Company Description</label>
                                    <textarea {...methods.register('companyDescription')} rows="4" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                                </div>
                                <Input name="website" label="Company Website" placeholder="https://example.com" className="mt-4"/>
                            </fieldset>
                        )}
                        
                        <Button type="submit" isLoading={mutation.isPending} className="mt-6">
                            Save Changes
                        </Button>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
};
export default EditProfilePage;