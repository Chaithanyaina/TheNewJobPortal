import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const SignupPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { login } = useAuth();
    const [role, setRole] = useState('Job Seeker');
    const methods = useForm();
    const { handleSubmit, setError, formState: { errors } } = methods;

    const mutation = useMutation({
        mutationFn: (formData) => axiosInstance.post('/auth/signup', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        onSuccess: ({ data }) => {
            toast.success('Account created! Welcome to JobPortal.');
            login(data.data.user, data.token);
            queryClient.invalidateQueries();
            navigate('/profile'); 
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Signup failed. Please try again.';
            toast.error(message);
            setError('root.serverError', { type: 'manual', message });
        }
    });

    const onSubmit = (data) => {
        const formData = new FormData();
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('role', role);

        if (role === 'Job Seeker') {
            if (data.resume && data.resume[0]) {
                formData.append('resume', data.resume[0]);
            }
        } else if (role === 'Employer') {
            formData.append('companyName', data.companyName);
        }
        
        mutation.mutate(formData);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-lg mx-auto p-8 border rounded-lg shadow-lg bg-white">
                <h2 className="text-3xl font-bold text-center mb-6">Create an Account</h2>
                
                <div className="flex justify-center border rounded-lg p-1 mb-6 bg-secondary">
                    <button type="button" onClick={() => setRole('Job Seeker')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${role === 'Job Seeker' ? 'bg-primary text-white shadow' : ''}`}>Job Seeker</button>
                    <button type="button" onClick={() => setRole('Employer')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${role === 'Employer' ? 'bg-primary text-white shadow' : ''}`}>Employer</button>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input name="firstName" label="First Name" validation={{ required: 'First name is required' }}/>
                            <Input name="lastName" label="Last Name" validation={{ required: 'Last name is required' }}/>
                        </div>
                        <Input name="email" label="Email" type="email" validation={{ required: 'Email is required' }}/>
                        <Input name="password" label="Password" type="password" validation={{ required: 'Password is required' }}/>
                        
                        {role === 'Employer' && (
                            <Input name="companyName" label="Company Name" validation={{ required: 'Company name is required' }} />
                        )}

                        {role === 'Job Seeker' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Resume (PDF)</label>
                                <input type="file" {...methods.register('resume', { required: 'Resume is required for job seekers.' })} accept="application/pdf" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary"/>
                                {errors.resume && <p className="text-red-600 text-sm mt-1">{errors.resume.message}</p>}
                            </div>
                        )}
                        
                        {errors.root?.serverError && (
                            <p className="text-red-600 text-sm text-center">{errors.root.serverError.message}</p>
                        )}

                        <Button type="submit" isLoading={mutation.isPending}>Create Account</Button>
                    </form>
                </FormProvider>
                 <p className="text-center mt-4 text-sm">Already have an account? <Link to="/login" className="font-semibold text-primary">Log in</Link></p>
            </div>
        </div>
    );
};

export default SignupPage;