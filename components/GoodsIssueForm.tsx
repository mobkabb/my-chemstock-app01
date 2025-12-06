import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Batch, QcStatus, Product } from '../types';
import { PackageMinus, ArrowRight, AlertTriangle, CheckCircle, Wand2 } from 'lucide-react';

interface ManualAllocation {
  batchId: number;
  issueQty: number; // User manually inputs this
}

interface GoodsIssueFormProps {
    inventory: Batch[];
    products: Product[];
    onIssue: (allocations: { batchId: number; deductQty: number }[]) => void;
}

export const GoodsIssueForm: React.FC<GoodsIssueFormProps> = ({ inventory, products, onIssue }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState('');
  
  // Auto-Allocation State
  const [targetQty, setTargetQty] = useState<string>('');

  // Map of batchId -> quantity to issue
  const [manualAllocations, setManualAllocations] = useState<Record<number, number>>({});
  
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Filter batches when product changes
  useEffect(() => {
    if (!selectedProductId) {
      setAvailableBatches([]);
      setManualAllocations({});
      setTargetQty('');
      return;
    }

    const pid = parseInt(selectedProductId);
    // Find all batches for this product with > 0 quantity
    // Sort by Expiry Date ASC for FEFO visibility
    const batches = inventory
        .filter(b => b.productId === pid && b.quantity > 0)
        .sort((a, b) => new Date(a.expDate).getTime() - new Date(b.expDate).getTime());

    setAvailableBatches(batches);
    setManualAllocations({}); // Reset inputs
    setTargetQty('');
  }, [selectedProductId, inventory]);

  const handleQuantityChange = (batchId: number, value: string, max: number) => {
      const numVal = parseFloat(value);
      if (isNaN(numVal) || numVal < 0) {
          const newAlloc = { ...manualAllocations };
          delete newAlloc[batchId];
          setManualAllocations(newAlloc);
          return;
      }
      
      // Allow user to type, validation happens on submit or UI warning
      setManualAllocations(prev => ({
          ...prev,
          [batchId]: numVal
      }));
  };

  const handleAutoAllocate = () => {
      const needed = parseFloat(targetQty);
      if (isNaN(needed) || needed <= 0) return;

      let remaining = needed;
      const newAllocations: Record<number, number> = {};
      
      // 1. Filter for valid stock (RELEASED) only for auto-logic
      const validBatches = availableBatches.filter(b => b.qcStatus === QcStatus.RELEASED);

      if (validBatches.length === 0) {
          alert("No 'RELEASED' stock available for this product.");
          return;
      }

      // 2. Iterate (Already sorted by FEFO from useEffect)
      for (const batch of validBatches) {
          if (remaining <= 0) break;
          
          const toTake = Math.min(remaining, batch.quantity);
          newAllocations[batch.id] = toTake;
          remaining -= toTake;
      }

      setManualAllocations(newAllocations);

      if (remaining > 0) {
          alert(`Warning: Insufficient 'RELEASED' stock. Allocated what was available, but still missing ${remaining.toFixed(2)} units.`);
      }
  };

  const totalSelectedQty = (Object.values(manualAllocations) as number[]).reduce((sum, val) => sum + val, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalSelectedQty <= 0) return;

    // Validate if any quantity exceeds available
    const hasError = availableBatches.some(b => (manualAllocations[b.id] || 0) > b.quantity);
    if(hasError) {
        alert("Cannot issue more than available quantity for a batch.");
        return;
    }

    setLoading(true);
    
    // Prepare data
    const finalAllocations = Object.entries(manualAllocations).map(([bId, qty]) => ({
        batchId: parseInt(bId),
        deductQty: qty as number
    })).filter(a => a.deductQty > 0);

    // Simulate API call
    setTimeout(() => {
      onIssue(finalAllocations);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
          setSuccess(false);
          handleClear();
      }, 2000);
    }, 1000);
  };

  const handleClear = () => {
    setSelectedProductId('');
    setReferenceNo('');
    setManualAllocations({});
    setTargetQty('');
  };

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Goods Issue (Outbound)</h1>
        <p className="text-slate-500">Manually select batches or use FEFO auto-allocation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
              <CardHeader>
                  <div className="flex items-center gap-2">
                      <PackageMinus className="w-5 h-5 text-accent" />
                      <CardTitle>Transaction Details</CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Product Select */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Item to Issue</label>
                        <select 
                            className="w-full rounded-md border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-accent"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            required
                        >
                            <option value="">-- Choose Material --</option>
                            {products.map(p => (
                            <option key={p.id} value={p.id}>{p.tradeName} ({p.sku})</option>
                            ))}
                        </select>
                    </div>

                    {/* Reference No */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reference No. (PO / SO)</label>
                        <input 
                            type="text" 
                            placeholder="e.g. JOB-2024-001"
                            className="w-full rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-accent"
                            value={referenceNo}
                            onChange={(e) => setReferenceNo(e.target.value)}
                        />
                    </div>
              </CardContent>
          </Card>

          {/* BATCH SELECTION TABLE */}
          <Card>
              <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Allocation Strategy</CardTitle>
                    {selectedProduct && (
                        <span className="text-sm font-medium text-slate-500">
                            Total Selected: <span className="text-blue-600 text-lg font-bold">{totalSelectedQty}</span> {selectedProduct.baseUnit}
                        </span>
                    )}
                  </div>
              </CardHeader>
              <CardContent>
                  {!selectedProductId ? (
                      <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                          <PackageMinus className="mx-auto w-12 h-12 mb-3 text-slate-200" />
                          <p>Please select a product above to view available batches.</p>
                      </div>
                  ) : availableBatches.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
                          <AlertTriangle className="mx-auto w-10 h-10 mb-2 text-orange-400" />
                          <p className="font-medium">No stock available for this product.</p>
                      </div>
                  ) : (
                      <div className="space-y-6">
                          {/* FEFO Auto Allocator */}
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col md:flex-row items-end md:items-center gap-4">
                              <div className="flex-1 w-full">
                                  <label className="block text-xs font-bold text-blue-800 mb-1 uppercase tracking-wider">
                                      Auto-Allocate (FEFO)
                                  </label>
                                  <p className="text-xs text-blue-600 mb-2">
                                      Automatically select batches starting from earliest expiry (Released status only).
                                  </p>
                                  <div className="flex gap-2">
                                    <input 
                                        type="number"
                                        placeholder={`Total Qty Needed (${selectedProduct?.baseUnit})`}
                                        className="flex-1 rounded-md border border-blue-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={targetQty}
                                        onChange={(e) => setTargetQty(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleAutoAllocate}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition"
                                    >
                                        <Wand2 size={16} /> Auto Fill
                                    </button>
                                  </div>
                              </div>
                          </div>

                          <div className="overflow-x-auto border rounded-lg border-slate-200">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-slate-100 text-slate-600 font-medium border-b border-slate-200">
                                      <tr>
                                          <th className="px-4 py-3">Batch / Lot No.</th>
                                          <th className="px-4 py-3">Location</th>
                                          <th className="px-4 py-3">Exp Date</th>
                                          <th className="px-4 py-3">Status</th>
                                          <th className="px-4 py-3 text-right">Available</th>
                                          <th className="px-4 py-3 w-40 text-right">Issue Qty</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {availableBatches.map(batch => {
                                          const isExpiring = new Date(batch.expDate) < new Date(new Date().setDate(new Date().getDate() + 30));
                                          const inputQty = manualAllocations[batch.id] || 0;
                                          const isOver = inputQty > batch.quantity;

                                          return (
                                              <tr key={batch.id} className={`hover:bg-slate-50 ${inputQty > 0 ? 'bg-blue-50/40' : ''}`}>
                                                  <td className="px-4 py-3 font-mono font-medium text-slate-900">{batch.lotNumber}</td>
                                                  <td className="px-4 py-3 text-slate-600">{batch.location}</td>
                                                  <td className={`px-4 py-3 ${isExpiring ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                                                      {batch.expDate}
                                                      {isExpiring && <span className="ml-1 text-xs">⚠️</span>}
                                                  </td>
                                                  <td className="px-4 py-3"><Badge status={batch.qcStatus} /></td>
                                                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                                                      {batch.quantity} <span className="text-xs font-normal text-slate-400">{selectedProduct?.baseUnit}</span>
                                                  </td>
                                                  <td className="px-4 py-2">
                                                      <input 
                                                          type="number"
                                                          min="0"
                                                          max={batch.quantity}
                                                          step="0.01"
                                                          placeholder="0"
                                                          className={`w-full text-right p-2 rounded border focus:ring-2 focus:outline-none ${isOver ? 'border-red-500 ring-red-200' : 'border-slate-300 focus:ring-accent'}`}
                                                          value={manualAllocations[batch.id] === undefined ? '' : manualAllocations[batch.id]}
                                                          onChange={(e) => handleQuantityChange(batch.id, e.target.value, batch.quantity)}
                                                      />
                                                  </td>
                                              </tr>
                                          );
                                      })}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  )}
              </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
               <button 
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-3 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                    Clear Form
                </button>
                <button 
                    type="submit"
                    disabled={loading || totalSelectedQty <= 0}
                    className={`px-8 py-3 rounded-md text-white font-medium flex items-center gap-2 shadow-sm ${
                        loading || totalSelectedQty <= 0
                        ? 'bg-slate-300 cursor-not-allowed' 
                        : 'bg-primary hover:bg-slate-800'
                    }`}
                >
                    {loading ? 'Processing...' : `Confirm Issue (${totalSelectedQty} ${selectedProduct?.baseUnit || ''})`}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
          </div>
      </form>
      
      {success && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50">
            <CheckCircle className="w-5 h-5" />
            Stock Issued Successfully!
        </div>
      )}
    </div>
  );
};
