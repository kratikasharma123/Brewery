export const getDashboardPath = (user) => {
  const role = user?.role?.toLowerCase();

  if (role === 'customer') {
    return '/customer-dashboard';
  }

  if (role === 'admin' || role === 'staff') {
    return '/dashboard';
  }

  return '/login';
};
