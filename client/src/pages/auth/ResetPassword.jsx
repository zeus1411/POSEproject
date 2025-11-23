import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // You could add a check here to verify the token is valid
    // by making an API call if needed
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword(token, password);
      
      toast.success('Password reset successfully! Redirecting to login...');
      setIsResetting(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid or expired reset token';
      toast.error(errorMessage);
      if (errorMessage.includes('Invalid') || errorMessage.includes('expired')) {
        setIsValidToken(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen relative flex overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80" 
            alt="Coral Reef Aquarium" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-cyan-900/65 to-teal-900/70" />
        </div>
        <div className="relative z-10 w-full flex items-center justify-center px-4 py-12">
          <div className="backdrop-blur-2xl bg-white/15 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/30 p-12 max-w-lg text-center space-y-6">
            <div className="text-6xl">❌</div>
            <h2 className="text-3xl font-extrabold text-white">
              Invalid or Expired Link
            </h2>
            <p className="text-base text-white/80">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="pt-4">
              <Link
                to="/forgot-password"
                className="inline-block px-8 py-3 text-sm font-bold tracking-wider rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300 shadow-lg"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isResetting) {
    return (
      <div className="min-h-screen relative flex overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80" 
            alt="Coral Reef Aquarium" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-cyan-900/65 to-teal-900/70" />
        </div>
        <div className="relative z-10 w-full flex items-center justify-center px-4 py-12">
          <div className="backdrop-blur-2xl bg-white/15 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/30 p-12 max-w-lg text-center space-y-6 animate-fade-in">
            <div className="text-6xl animate-bounce">✅</div>
            <h2 className="text-3xl font-extrabold text-white">
              Password Reset Successful!
            </h2>
            <p className="text-base text-white/80">
              Redirecting you to the login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex overflow-hidden">
      {/* Fullscreen Aquarium Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80" 
          alt="Coral Reef Aquarium" 
          className="w-full h-full object-cover"
        />
        {/* Dark Blue/Cyan Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-cyan-900/65 to-teal-900/70" />
      </div>

      {/* Content Container - Improved Centering */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-16 px-4 sm:px-8 lg:px-20 xl:px-32 py-12">
        
        {/* Hero Text - Left Side (animated fade-in from left) */}
        <div className="w-full lg:w-1/2 lg:flex-shrink-0 animate-fade-in-left">
          <div className="max-w-2xl space-y-6">
            <p className="text-cyan-300 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase">SECURE ACCESS</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
              NEW<br />BEGINNING
            </h1>
            <p className="text-lg sm:text-xl text-white/95 font-light leading-relaxed">
              Create a strong new password<br />and dive back in.
            </p>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
              Your account security is our priority. Choose a password that's memorable yet strong.
            </p>
          </div>
        </div>

        {/* Glassmorphism Form Card - Larger & Better Centered (animated slide-in from right) */}
        <div className="w-full lg:w-1/2 flex justify-center animate-slide-in-right">
          <div className="w-full max-w-2xl">
            {/* Extra Large Glassmorphism Card */}
            <div className="backdrop-blur-2xl bg-white/15 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/30 p-8 sm:p-12 lg:p-14">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-extrabold text-white">
            Reset Your Password
          </h2>
          <p className="mt-3 text-center text-sm text-white/80">
            Please enter your new password below.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                placeholder="New Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-white mb-2 tracking-wide">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-sm"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-6 border border-transparent text-sm font-bold tracking-wider rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
          
          <div className="text-center pt-4">
            <Link 
              to="/login" 
              className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 hover:underline transition-all duration-300"
            >
              Back to Sign in
            </Link>
          </div>
        </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
