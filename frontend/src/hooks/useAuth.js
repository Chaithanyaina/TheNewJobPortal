import useAuthStore from '../store/authStore';
export const useAuth = () => {
  const { user, token, login, logout, setUser } = useAuthStore();
  const isAuthenticated = !!token;
  const role = user?.role;
  return { user, token, isAuthenticated, role, login, logout, setUser };
};