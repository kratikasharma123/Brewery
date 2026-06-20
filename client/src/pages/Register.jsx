import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { chooseRole, login, register, reset } from '../features/auth/authSlice';
import { Beer, User, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft, ShieldCheck, ShoppingCart } from 'lucide-react';
import { getDashboardPath } from '../utils/authRoutes';
import { EMAIL_PATTERN, EMAIL_VALIDATION_MESSAGE } from '../utils/emailValidation';
import { NAME_PATTERN, NAME_VALIDATION_MESSAGE, sanitizeNameInput } from '../utils/nameValidation';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleChoice, setShowRoleChoice] = useState(false);
  const [registerNotice, setRegisterNotice] = useState('');

  const { name, email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const clearAutofill = window.setTimeout(() => {
      setFormData({ name: '', email: '', password: '' });
    }, 150);

    return () => window.clearTimeout(clearAutofill);
  }, []);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const onChange = (e) => {
    setRegisterNotice('');
    const value = e.target.name === 'name' ? sanitizeNameInput(e.target.value) : e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setRegisterNotice('');
    setShowRoleChoice(true);
  };

  const handleContinueAs = async (role) => {
    const userData = {
      name,
      email,
      password,
      role,
    };

    try {
      if (user) {
        const updatedUser = await dispatch(chooseRole(role)).unwrap();
        navigate(getDashboardPath(updatedUser), { replace: true });
        return;
      }

      const registeredUser = await dispatch(register(userData)).unwrap();
      const selectedRoleUser = registeredUser.role === role
        ? registeredUser
        : await dispatch(chooseRole(role)).unwrap();
      setFormData({ name: '', email: '', password: '' });
      navigate(getDashboardPath(selectedRoleUser), { replace: true });
    } catch (error) {
      if (String(error).toLowerCase().includes('user already exists')) {
        try {
          const loggedInUser = await dispatch(login({ email, password })).unwrap();
          const updatedUser = loggedInUser.role === role
            ? loggedInUser
            : await dispatch(chooseRole(role)).unwrap();
          dispatch(reset());
          setFormData({ name: '', email: '', password: '' });
          navigate(getDashboardPath(updatedUser), { replace: true });
        } catch {
          setRegisterNotice('This email is already registered. Please use the existing password or a different email.');
        }
      } else {
        setRegisterNotice(String(error));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500 shadow-lg shadow-amber-500/5">
            <Beer className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            {showRoleChoice ? 'Choose Account Type' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-sm">
            {showRoleChoice
              ? `Welcome ${user?.name || 'there'}! Select how you want to continue.`
              : 'Create your account for bookings, shopping, or admin access'}
          </p>
        </div>

        {/* Error alert */}
        {(isError || registerNotice) && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{registerNotice || message || 'Registration failed'}</span>
          </div>
        )}

        {showRoleChoice ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleContinueAs('Admin')}
              disabled={isLoading}
              className="group w-full rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 text-left transition-all hover:border-amber-400/60 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/30">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-lg font-extrabold text-slate-50">Continue as Admin</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-400">
                    Manage dashboard, inventory, bookings, staff, and customer orders.
                  </span>
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleContinueAs('Customer')}
              disabled={isLoading}
              className="group w-full rounded-2xl border border-sky-500/25 bg-sky-500/10 p-5 text-left transition-all hover:border-sky-400/60 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-400 text-slate-950 shadow-lg shadow-sky-950/30">
                  <ShoppingCart className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-lg font-extrabold text-slate-50">Continue as Customer</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-400">
                    Browse products, add items to cart, place orders, and book tastings.
                  </span>
                </span>
              </div>
            </button>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-amber-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing your dashboard...
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5" autoComplete="off">
              <input type="text" name="username" autoComplete="username" tabIndex={-1} className="hidden" aria-hidden="true" />
              <input type="password" name="current-password" autoComplete="current-password" tabIndex={-1} className="hidden" aria-hidden="true" />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                    pattern={NAME_PATTERN}
                    title={NAME_VALIDATION_MESSAGE}
                    autoComplete="off"
                    className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    pattern={EMAIL_PATTERN}
                    title={EMAIL_VALIDATION_MESSAGE}
                    autoComplete="off"
                    inputMode="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    autoComplete="new-password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl glass-input text-sm"
                    placeholder="Min 8 characters"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-amber-400 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
