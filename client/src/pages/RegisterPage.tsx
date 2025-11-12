import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Store, Shield } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'cashier'>('admin');
  const [isLoading, setIsLoading] = useState(false);
  
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password, roles: [role] });
      toast.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <Store className="h-16 w-16 text-brand-red" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-white drop-shadow-lg">
            Create your account
          </h2>
          <p className="mt-2 text-center text-lg text-white/90 font-medium">
            Join Mini Store ERP today
          </p>
        </div>
        
        {/* Register Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 bg-white border-2 border-red-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-red-50/30 hover:border-red-400 hover:bg-red-50/20 transition-all duration-200"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 bg-white border-2 border-red-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-red-50/30 hover:border-red-400 hover:bg-red-50/20 transition-all duration-200"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  Account Type
                </div>
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none block w-full px-3 py-3 bg-white border-2 border-red-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-red-50/30 hover:border-red-400 hover:bg-red-50/20 transition-all duration-200"
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'cashier')}
              >
                <option value="admin">👑 Admin (Full Access)</option>
                <option value="cashier">💰 Cashier (Limited Access)</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                <strong>Admin:</strong> Manage products, purchases, expenses, and view all reports.<br />
                <strong>Cashier:</strong> Record sales and view basic reports only.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 bg-white border-2 border-red-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-red-50/30 hover:border-red-400 hover:bg-red-50/20 transition-all duration-200"
                  placeholder="Create password (min. 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 bg-white border-2 border-red-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-red-50/30 hover:border-red-400 hover:bg-red-50/20 transition-all duration-200"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-red hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <UserPlus className="h-5 w-5" />
                </span>
                {isLoading ? 'Creating account...' : 'Register Now'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="font-semibold text-brand-red hover:text-brand-red-dark transition-colors duration-200"
              >
                Already have an account? <span className="underline">Sign in</span>
              </Link>
            </div>
          </form>

          {/* Promotional Message */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-red-50 to-purple-50 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-gray-700">
                🚀 Start managing your store like a pro!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
