import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { ArrowLeft } from 'lucide-react';

const EditJobPage = () => {
    const { id: jobId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const methods = useForm();
    const { handleSubmit, reset } = methods;

    // 1. Fetch the current job data
    const { data: job, isLoading } = useQuery({
        queryKey: ['job', jobId],
        queryFn: () => axiosInstance.get(`/jobs/${jobId}`).then(res => res.data.data.job),
        enabled: !!jobId,
    });

    // 2. Populate the form once the data is loaded
    useEffect(() => {
        if (job) {
            reset({
                title: job.title,
                description: job.description,
                location: job.location,
                type: job.type,
                salaryMin: job.salary_min,
                salaryMax: job.salary_max,
                isActive: job.is_active,
            });
        }
    }, [job, reset]);

    // 3. Set up the mutation to save changes
    const mutation = useMutation({
        mutationFn: (updatedJobData) => axiosInstance.put(`/employer/jobs/${jobId}`, updatedJobData),
        onSuccess: () => {
            toast.success('Job updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['myEmployerJobs'] });
            queryClient.invalidateQueries({ queryKey: ['job', jobId] });
            navigate('/employer/dashboard');
        },
        onError: () => toast.error('Failed to update job.'),
    });

    if (isLoading) return <div className="py-20"><Spinner /></div>;

    return (
        <div className="container mx-auto px-4 py-12">
            <Link to="/employer/dashboard" className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:underline">
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <div className="max-w-3xl mx-auto p-8 border rounded-lg shadow-lg bg-surface">
                <h1 className="text-3xl font-bold mb-6 text-center">Edit Job Posting</h1>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-6">
                        <Input name="title" label="Job Title" validation={{ required: true }}/>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea {...methods.register('description')} rows="5" className="w-full p-2 border rounded-md"/>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Input name="location" label="Location"/>
                            <select {...methods.register('type')} className="w-full p-2 border rounded-md">
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Input name="salaryMin" label="Min Salary" type="number"/>
                            <Input name="salaryMax" label="Max Salary" type="number"/>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" {...methods.register('isActive')} id="isActive" className="h-4 w-4"/>
                            <label htmlFor="isActive" className="font-medium">Job is Active (visible to candidates)</label>
                        </div>
                        <Button type="submit" isLoading={mutation.isPending}>
                            Save Changes
                        </Button>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
};
export default EditJobPage;