import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const PostJobPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const methods = useForm();
  const { handleSubmit, setError } = methods;

  const mutation = useMutation({
    mutationFn: (newJobData) => axiosInstance.post('/jobs', newJobData),
    onSuccess: ({ data }) => {
      toast.success('Job posted successfully!');
      queryClient.invalidateQueries({ queryKey: ['myEmployerJobs'] });
      navigate(`/employer/jobs/${data.data.job.id}/applicants`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to post job.';
      toast.error(message);
      setError('root.serverError', { type: 'manual', message });
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto p-8 border rounded-lg shadow-lg bg-surface">
        <h1 className="text-3xl font-bold mb-6 text-center">Post a New Job</h1>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">

            <Input
              name="title"
              label="Job Title"
              placeholder="e.g., Senior Frontend Developer"
              validation={{ required: 'Job title is required' }}
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea
                {...methods.register('description', { required: 'Description is required' })}
                rows="5"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {methods.formState.errors.description && (
                <p className="text-red-600 text-sm mt-1">
                  {methods.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="location"
                label="Location"
                placeholder="e.g., Hyderabad or Remote"
                validation={{ required: 'Location is required' }}
              />
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Job Type</label>
                <select
                  {...methods.register('type', { required: 'Job type is required' })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
                {methods.formState.errors.type && (
                  <p className="text-red-600 text-sm mt-1">{methods.formState.errors.type.message}</p>
                )}
              </div>
            </div>

            {/* --- NEW SALARY FIELDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="salaryMin"
                label="Minimum Annual Salary (Optional)"
                type="number"
                placeholder="e.g., 800000"
              />
              <Input
                name="salaryMax"
                label="Maximum Annual Salary (Optional)"
                type="number"
                placeholder="e.g., 1200000"
              />
            </div>

            {/* --- RESPONSIBILITIES & QUALIFICATIONS (OPTIONAL) --- */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Responsibilities (Optional)
              </label>
              <textarea
                {...methods.register('responsibilities')}
                rows="3"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Qualifications (Optional)
              </label>
              <textarea
                {...methods.register('qualifications')}
                rows="3"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {methods.formState.errors.root?.serverError && (
              <p className="text-red-600 text-sm mb-4 text-center">
                {methods.formState.errors.root.serverError.message}
              </p>
            )}

            <Button type="submit" isLoading={mutation.isPending}>
              {mutation.isPending ? 'Posting Job...' : 'Post Job'}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default PostJobPage;
