import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { User, UserRole } from '../types';
import { LogIn, Lock, Mail, FlaskConical } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API Login
    setTimeout(() => {
      setLoading(false);
      // Mock successful login
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: email,
        role: UserRole.WAREHOUSE, // Default mock role
        initials: 'JD'
      };
      onLogin(mockUser);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-3xl">C</span>
            </div>
        </div>
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">ChemStock ERP</h1>
            <p className="text-slate-500">Sign in to manage inventory</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-md text-white font-medium transition-colors flex items-center justify-center gap-2 ${
                  loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <LogIn className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 text-center pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <button 
                  onClick={onNavigateToRegister}
                  className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Create Profile
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};