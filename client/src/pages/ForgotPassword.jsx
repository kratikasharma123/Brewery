import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AlertCircle, Beer, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { forgotPassword, reset } from '../features/auth/authSlice';
import { EMAIL_PATTERN, EMAIL_VALIDATION_MESSAGE } from '../utils/emailValidation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(forgotPassword({ email })).unwrap();
    } catch {
      // Firebase reset failure will be handled by auth state error display
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500 shadow-lg shadow-amber-500/5">
            <Beer className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="text-slate-400 text-sm">
            Enter your registered email. Firebase will send a secure password recovery link.
          </p>
        </div>

        {isError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{message || 'Password reset failed'}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <span>{message || 'Password reset email sent. Please check your inbox.'}</span>
              <button
                type="button"
                onClick={onSubmit}
                disabled={isLoading}
                className="mt-3 block text-left text-xs font-extrabold uppercase tracking-wider text-emerald-200 underline-offset-4 transition hover:text-white hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resend Email
              </button>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
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
                onChange={(event) => setEmail(event.target.value)}
                required
                pattern={EMAIL_PATTERN}
                title={EMAIL_VALIDATION_MESSAGE}
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                placeholder="you@example.com"
              />
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
                Sending Email...
              </>
            ) : (
              'Send Recovery Email'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
