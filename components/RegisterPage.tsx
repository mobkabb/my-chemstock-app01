import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { User, UserRole } from '../types';
import { UserPlus, Lock, Mail, User as UserIcon, Building2 } from 'lucide-react';

interface RegisterPageProps {
  onRegister: (user: User) => void;
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.WAREHOUSE);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Get initials
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    // Simulate API Registration
    setTimeout(() => {
      setLoading(false);
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role,
        initials
      };
      onRegister(newUser);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-3xl">C</span>
            </div>
        </div>
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500">Join the inventory management team</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department / Role</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <select
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    <option value={UserRole.WAREHOUSE}>Warehouse Staff</option>
                    <option value={UserRole.QC}>QC / Lab Specialist</option>
                    <option value={UserRole.ADMIN}>System Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-md text-white font-medium transition-colors flex items-center justify-center gap-2 ${
                  loading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loading ? 'Creating Profile...' : 'Register'}
                {!loading && <UserPlus className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 text-center pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <button 
                  onClick={onNavigateToLogin}
                  className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};