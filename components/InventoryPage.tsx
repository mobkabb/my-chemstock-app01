import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Batch, QcStatus, Product } from '../types';
import { Plus, Search, Trash2, Edit, Save, X, PackageOpen } from 'lucide-react';

interface InventoryPageProps {
  inventory: Batch[];
  products: Product[];
  onAdd: (batch: Batch) => void;
  onUpdate: (batch: Batch) => void;
  onDelete: (id: number) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ inventory, products, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Batch>>({
    productId: undefined,
    lotNumber: '',
    mfgDate: '',
    expDate: '',
    quantity: 0,
    location: '',
    qcStatus: QcStatus.QUARANTINE
  });

  // Filter Inventory
  const filteredInventory = inventory.filter(item => {
    const product = products.find(p => p.id === item.productId);
    const searchString = `${item.lotNumber} ${product?.tradeName} ${item.location}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleOpenModal = (batch?: Batch) => {
    if (batch) {
        setEditingId(batch.id);
        setFormData(batch);
    } else {
        // Find first available product ID for default
        const defaultProdId = products.length > 0 ? products[0].id : undefined;
        setEditingId(null);
        setFormData({
            productId: defaultProdId,
            lotNumber: '',
            mfgDate: new Date().toISOString().split('T')[0],
            expDate: '',
            quantity: 0,
            location: '',
            qcStatus: QcStatus.QUARANTINE
        });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
        onUpdate({ ...formData, id: editingId } as Batch);
    } else {
        onAdd({ ...formData, id: Date.now() } as Batch);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
      if(window.confirm('Are you sure you want to remove this batch completely?')) {
          onDelete(id);
      }
  }

  const getProductName = (id: number) => products.find(p => p.id === id)?.tradeName || 'Unknown';
  const getProductUnit = (id: number) => products.find(p => p.id === id)?.baseUnit || 'Units';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory Stock</h1>
            <p className="text-slate-500">Manage batches, locations, and adjustments.</p>
        </div>
        <button 
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
        >
            <Plus size={18} />
            <span>Add Manual Batch</span>
        </button>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                    <input 
                        type="text"
                        placeholder="Search by Lot, Name, or Location..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-accent outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {inventory.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <PackageOpen className="mx-auto w-12 h-12 mb-3 text-slate-300" />
                    <p className="text-lg font-medium text-slate-600">Inventory is empty</p>
                    <p className="text-sm">Receive goods or add a manual batch to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Lot No.</th>
                                <th className="px-6 py-3 text-right">Qty</th>
                                <th className="px-6 py-3">Location</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Exp Date</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map(item => (
                                <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {getProductName(item.productId)}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{item.lotNumber}</td>
                                    <td className="px-6 py-4 text-right font-bold">
                                        {item.quantity} <span className="text-xs font-normal text-slate-500">{getProductUnit(item.productId)}</span>
                                    </td>
                                    <td className="px-6 py-4">{item.location}</td>
                                    <td className="px-6 py-4"><Badge status={item.qcStatus} /></td>
                                    <td className={`px-6 py-4 text-right ${new Date(item.expDate) < new Date() ? 'text-red-600 font-bold' : ''}`}>
                                        {item.expDate}
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-2">
                                        <button onClick={() => handleOpenModal(item)} className="p-1 text-slate-500 hover:text-blue-600 rounded">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-1 text-slate-500 hover:text-red-600 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Batch' : 'Add New Batch'}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                        <select 
                            className="w-full border border-slate-300 rounded-md p-2 bg-white"
                            value={formData.productId}
                            onChange={e => setFormData({...formData, productId: parseInt(e.target.value)})}
                            required
                        >
                            {products.length === 0 && <option value="">No Products Defined</option>}
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.tradeName}</option>
                            ))}
                        </select>
                        {products.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">Please go to Product Master to add products first.</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Lot Number</label>
                            <input 
                                type="text"
                                className="w-full border border-slate-300 rounded-md p-2"
                                value={formData.lotNumber}
                                onChange={e => setFormData({...formData, lotNumber: e.target.value})}
                                required
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                            <input 
                                type="text"
                                className="w-full border border-slate-300 rounded-md p-2"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mfg Date</label>
                            <input 
                                type="date"
                                className="w-full border border-slate-300 rounded-md p-2"
                                value={formData.mfgDate}
                                onChange={e => setFormData({...formData, mfgDate: e.target.value})}
                                required
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Exp Date</label>
                            <input 
                                type="date"
                                className="w-full border border-slate-300 rounded-md p-2"
                                value={formData.expDate}
                                onChange={e => setFormData({...formData, expDate: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                            <input 
                                type="number"
                                className="w-full border border-slate-300 rounded-md p-2"
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                                required
                                min="0"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">QC Status</label>
                            <select 
                                className="w-full border border-slate-300 rounded-md p-2 bg-white"
                                value={formData.qcStatus}
                                onChange={e => setFormData({...formData, qcStatus: e.target.value as QcStatus})}
                            >
                                {Object.values(QcStatus).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={products.length === 0} className="flex-1 py-2 bg-primary text-white rounded-md hover:bg-slate-800 flex items-center justify-center gap-2">
                            <Save size={16} /> Save Batch
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};