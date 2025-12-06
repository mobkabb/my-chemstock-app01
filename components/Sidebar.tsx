import React from 'react';
import { LayoutDashboard, ShoppingCart, TestTube, Layers, Settings, PackageSearch, PackageMinus } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory Stock', icon: Layers },
    { id: 'receive', label: 'Goods Receipt', icon: ShoppingCart },
    { id: 'issue', label: 'Goods Issue (FEFO)', icon: PackageMinus },
    { id: 'qc', label: 'QC Management', icon: TestTube },
    { id: 'products', label: 'Product Master', icon: PackageSearch },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                C
             </div>
             <div>
                <h2 className="text-lg font-bold text-white tracking-tight">ChemStock</h2>
                <p className="text-xs text-slate-500">ERP System v1.0</p>
             </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-accent text-white' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-4 px-4 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                 {user?.initials || 'U'}
             </div>
             <div className="overflow-hidden">
                 <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                 <p className="text-xs text-slate-500 truncate">{user?.role}</p>
             </div>
        </div>
        <button 
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};