import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login, reset } from '../features/auth/authSlice';
import { Beer, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getDashboardPath } from '../utils/authRoutes';
import { EMAIL_PATTERN, EMAIL_VALIDATION_MESSAGE } from '../utils/emailValidation';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const passwordResetSuccess = new URLSearchParams(location.search).get('passwordReset') === 'success';

  const { user, isLoading, isError, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (user) {
      navigate(getDashboardPath(user), { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const clearAutofill = window.setTimeout(() => {
      setFormData({ email: '', password: '' });
    }, 100);

    return () => window.clearTimeout(clearAutofill);
  }, []);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      email,
      password,
    };

    try {
      const loggedInUser = await dispatch(login(userData)).unwrap();
      navigate(getDashboardPath(loggedInUser), { replace: true });
    } catch {
      // login failure will be handled by auth state error display
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Background blobs for premium depth */}
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
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm">
            Sign in to access your Brewery Dashboard
          </p>
        </div>

        {/* Error alert */}
        {isError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{message || 'Invalid credentials'}</span>
          </div>
        )}

        {passwordResetSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>Password changed successfully. Please sign in with your new password.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6" autoComplete="off">
          <input type="text" name="username" autoComplete="username" tabIndex={-1} className="hidden" aria-hidden="true" />
          <input type="password" name="current-password" autoComplete="current-password" tabIndex={-1} className="hidden" aria-hidden="true" />
          <div className="space-y-2">
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

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
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
                placeholder="••••••••"
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
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
