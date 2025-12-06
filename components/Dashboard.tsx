import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Batch, ProductType, Product } from '../types';
import { AlertTriangle, Package, Beaker, TrendingUp, PackageOpen } from 'lucide-react';

interface DashboardProps {
    inventory: Batch[];
    products: Product[];
}

export const Dashboard: React.FC<DashboardProps> = ({ inventory, products }) => {
  // Logic to find expiring items (mocking < 60 days)
  const expiringItems = inventory.filter(b => {
    const exp = new Date(b.expDate);
    const today = new Date();
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 60; // Less than 60 days
  });

  const totalChemicals = inventory
    .filter(b => products.find(p => p.id === b.productId)?.type === ProductType.CHEMICAL)
    .reduce((sum, b) => sum + b.quantity, 0);

  const totalPackaging = inventory
    .filter(b => products.find(p => p.id === b.productId)?.type === ProductType.PACKAGING)
    .reduce((sum, b) => sum + b.quantity, 0);

  const pendingQC = inventory.filter(b => b.qcStatus === 'QUARANTINE').length;

  const getProductName = (id: number) => products.find(p => p.id === id)?.tradeName || 'Unknown';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Overview Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white border-l-4 border-l-accent">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Chemicals</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalChemicals.toLocaleString()} kg</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Beaker className="w-5 h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-l-4 border-l-emerald-500">
          <CardContent className="pt-6">
             <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Packaging Stock</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalPackaging.toLocaleString()} pcs</h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
             <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Expiring Soon</p>
                <h3 className="text-2xl font-bold text-orange-600 mt-1">{expiringItems.length} Batches</h3>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
             <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Pending QC</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingQC} Lots</h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiry Alert Table */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
                <span className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" /> Critical Alerts (FEFO Risk)
                </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringItems.length === 0 ? (
                 <div className="text-center py-8 text-slate-400">
                    <PackageOpen className="mx-auto w-10 h-10 mb-2 opacity-50" />
                    <p>No batches expiring within 60 days.</p>
                 </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-3">Batch No.</th>
                                <th className="px-4 py-3">Product</th>
                                <th className="px-4 py-3">Exp Date</th>
                                <th className="px-4 py-3">Qty</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiringItems.map(item => (
                                <tr key={item.id} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-slate-700">{item.lotNumber}</td>
                                    <td className="px-4 py-3 font-medium">
                                        {getProductName(item.productId)}
                                    </td>
                                    <td className="px-4 py-3 text-red-600 font-bold">{item.expDate}</td>
                                    <td className="px-4 py-3">{item.quantity}</td>
                                    <td className="px-4 py-3"><Badge status={item.qcStatus} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity (Placeholder) */}
        <Card className="h-full">
            <CardHeader>
                <CardTitle>System Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {inventory.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">System waiting for initial stock entry...</p>
                ) : (
                     <ul className="space-y-4">
                        {inventory.slice(-5).reverse().map(item => (
                            <li key={item.id} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="font-medium text-slate-900">Stock Entry / Update</p>
                                    <p className="text-xs text-slate-500">
                                        {getProductName(item.productId)} - {item.lotNumber}
                                    </p>
                                </div>
                                <span className="text-xs text-slate-400">Just now</span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};