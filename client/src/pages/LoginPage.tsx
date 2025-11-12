import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Store } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 py-6 sm:py-12 px-3 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <Store className="h-12 w-12 sm:h-16 sm:w-16 text-brand-red" />
            </div>
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
            Mini Store ERP
          </h2>
          <p className="mt-2 text-center text-base sm:text-lg text-white/90 font-medium">
            Sign in to your account
          </p>
        </div>
        
        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 bg-white border-2 border-red-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-red-50/30 hover:border-red-400 hover:bg-red-50/20 transition-all duration-200 text-sm sm:text-base"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 bg-white border-2 border-red-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-red-50/30 hover:border-red-400 hover:bg-red-50/20 transition-all duration-200 text-sm sm:text-base"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 sm:py-3.5 px-4 border border-transparent text-sm sm:text-base font-bold rounded-xl text-white bg-gradient-red hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="font-semibold text-sm sm:text-base text-brand-blue hover:text-brand-blue-dark transition-colors duration-200"
              >
                Don't have an account? <span className="underline">Register now</span>
              </Link>
            </div>
          </form>

          {/* Promotional Message */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                🎉 Manage your store efficiently with our powerful ERP system!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
