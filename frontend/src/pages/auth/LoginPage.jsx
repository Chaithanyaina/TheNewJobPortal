import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { login } = useAuth();

  const methods = useForm();
  const { handleSubmit, setError } = methods;

  const mutation = useMutation({
    mutationFn: (credentials) => axiosInstance.post('/auth/login', credentials),
    onSuccess: ({ data }) => {
      toast.success('Login Successful! Welcome back.');

      const isFirstLogin = true; // In real apps, get from backend: e.g., data.data.user.firstLogin
      login(data.data.user, data.token);
      queryClient.invalidateQueries();

      const from = location.state?.from?.pathname || '/';
      const destination = isFirstLogin
        ? '/profile'
        : from === '/login'
        ? '/'
        : from;

      navigate(destination, { replace: true });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      setError('root.serverError', { type: 'manual', message });
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto p-8 border rounded-lg shadow-lg bg-white">
        <h2 className="text-3xl font-bold text-center mb-6">Log In</h2>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(data => mutation.mutate(data))} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                {...methods.register('email')}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                {...methods.register('password')}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark disabled:bg-gray-400"
            >
              {mutation.isPending ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </FormProvider>
        <p className="text-center mt-4 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
