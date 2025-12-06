import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { ReceiptFormData, Product, QcStatus } from '../types';
import { CheckCircle, AlertCircle, Upload, Archive, DollarSign } from 'lucide-react';

interface ReceiveGoodsFormProps {
    onReceive: (data: ReceiptFormData) => void;
    products: Product[];
}

export const ReceiveGoodsForm: React.FC<ReceiveGoodsFormProps> = ({ onReceive, products }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<ReceiptFormData & { qcStatus: QcStatus, unitCost: number }>({
    productId: '',
    lotNumber: '',
    supplier: '',
    mfgDate: '',
    expDate: '',
    quantity: 0,
    location: '',
    hasCoa: false,
    hasMsds: false,
    qcStatus: QcStatus.QUARANTINE, // Default, but editable
    unitCost: 0
  });

  const selectedProduct = products.find(p => p.id.toString() === formData.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate Server Action delay
    setTimeout(() => {
      onReceive(formData); // Call parent handler
      setLoading(false);
      setSuccess(true);
      // Reset after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setFormData({
            productId: '',
            lotNumber: '',
            supplier: '',
            mfgDate: '',
            expDate: '',
            quantity: 0,
            location: '',
            hasCoa: false,
            hasMsds: false,
            qcStatus: QcStatus.QUARANTINE,
            unitCost: 0
        });
      }, 2000);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Handle Checkbox
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Goods Receipt (Inbound)</h1>
        <p className="text-slate-500">Manually record incoming stock details.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-accent" />
              <CardTitle>Material Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Product Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Product</label>
              <select 
                name="productId"
                required
                className="w-full rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
                value={formData.productId}
                onChange={handleInputChange}
              >
                <option value="">-- Choose Material --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.tradeName} ({p.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
              <input 
                type="text" 
                name="supplier"
                required
                placeholder="e.g. BASF, Merck"
                className="w-full rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-accent focus:outline-none"
                value={formData.supplier}
                onChange={handleInputChange}
              />
            </div>

            {/* Lot Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lot / Batch No.</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="lotNumber"
                  required
                  placeholder="Scan or type Lot No."
                  className="w-full rounded-md border border-slate-300 p-2.5 pl-10 focus:ring-2 focus:ring-accent focus:outline-none font-mono"
                  value={formData.lotNumber}
                  onChange={handleInputChange}
                />
                <div className="absolute left-3 top-2.5 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mfg. Date</label>
              <input 
                type="date" 
                name="mfgDate"
                required
                className="w-full rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-accent focus:outline-none"
                value={formData.mfgDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exp. Date</label>
              <input 
                type="date" 
                name="expDate"
                required
                className="w-full rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-accent focus:outline-none"
                value={formData.expDate}
                onChange={handleInputChange}
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantity ({selectedProduct ? selectedProduct.baseUnit : 'Unit'})
              </label>
              <input 
                type="number" 
                name="quantity"
                min="0"
                step="0.01"
                required
                className="w-full rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-accent focus:outline-none"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </div>

             {/* Cost */}
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Cost (Optional)</label>
              <div className="relative">
                <input 
                    type="number" 
                    name="unitCost"
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-slate-300 p-2.5 pl-10 focus:ring-2 focus:ring-accent focus:outline-none"
                    value={formData.unitCost}
                    onChange={handleInputChange}
                />
                <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Location</label>
              <input 
                type="text" 
                name="location"
                placeholder="e.g. WH-A-01"
                required
                className="w-full rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-accent focus:outline-none"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>

            {/* Manual QC Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Status</label>
              <select 
                name="qcStatus"
                className="w-full rounded-md border border-slate-300 p-2.5 bg-white"
                value={formData.qcStatus}
                onChange={handleInputChange}
              >
                  <option value={QcStatus.QUARANTINE}>QUARANTINE (Default)</option>
                  <option value={QcStatus.RELEASED}>RELEASED</option>
                  <option value={QcStatus.REJECTED}>REJECTED</option>
              </select>
            </div>

          </CardContent>
        </Card>

        {/* Documentation Section */}
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Documentation</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                         <input 
                                type="checkbox" 
                                name="hasCoa"
                                id="hasCoa"
                                className="w-5 h-5 text-accent rounded focus:ring-accent"
                                checked={formData.hasCoa}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="hasCoa" className="text-sm font-medium text-slate-700">COA Document Verified</label>
                    </div>
                     <div className="flex items-center gap-3">
                         <input 
                                type="checkbox" 
                                name="hasMsds"
                                id="hasMsds"
                                className="w-5 h-5 text-accent rounded focus:ring-accent"
                                checked={formData.hasMsds}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="hasMsds" className="text-sm font-medium text-slate-700">MSDS Document Verified</label>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-12">
            <button 
                type="button"
                className="px-6 py-2.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            >
                Cancel
            </button>
            <button 
                type="submit"
                disabled={loading}
                className={`px-6 py-2.5 rounded-md text-white font-medium flex items-center gap-2 ${loading ? 'bg-slate-400' : 'bg-primary hover:bg-slate-800'}`}
            >
                {loading ? 'Processing...' : 'Confirm Receipt'}
                {!loading && <CheckCircle className="w-4 h-4" />}
            </button>
        </div>
      </form>
      
      {success && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-5 h-5" />
            Stock Received Successfully!
        </div>
      )}
    </div>
  );
};