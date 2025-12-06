import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Product, ProductType, UnitOfMeasure } from '../types';
import { PackageSearch, Plus, Save, X, FlaskConical, Box } from 'lucide-react';

interface ProductMasterPageProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
}

export const ProductMasterPage: React.FC<ProductMasterPageProps> = ({ products, onAddProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: '',
    tradeName: '',
    inciName: '',
    casNumber: '',
    type: ProductType.CHEMICAL,
    baseUnit: UnitOfMeasure.KG,
    minStockLevel: 0
  });

  const handleOpenModal = () => {
    setFormData({
        sku: '',
        tradeName: '',
        inciName: '',
        casNumber: '',
        type: ProductType.CHEMICAL,
        baseUnit: UnitOfMeasure.KG,
        minStockLevel: 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
        id: Date.now(), // Simple ID generation
        sku: formData.sku!,
        tradeName: formData.tradeName!,
        inciName: formData.inciName,
        casNumber: formData.casNumber,
        type: formData.type!,
        baseUnit: formData.baseUnit!,
        minStockLevel: Number(formData.minStockLevel)
    };
    onAddProduct(newProduct);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Product Master Data</h1>
            <p className="text-slate-500">Manage definitions for Chemicals and Packaging items.</p>
        </div>
        <button 
            onClick={handleOpenModal}
            className="bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
        >
            <Plus size={18} />
            <span>Add New Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Quick Stats */}
        <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-blue-600 font-bold uppercase">Total Items</p>
                    <p className="text-2xl font-bold text-blue-900">{products.length}</p>
                </div>
                <PackageSearch className="text-blue-300 w-8 h-8" />
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Registered Materials</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">SKU Code</th>
                            <th className="px-6 py-3">Trade Name / Description</th>
                            <th className="px-6 py-3">Scientific Info</th>
                            <th className="px-6 py-3">Base Unit</th>
                            <th className="px-6 py-3 text-right">Min. Stock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.map(product => (
                            <tr key={product.id} className="bg-white hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    {product.type === ProductType.CHEMICAL ? (
                                        <span className="flex items-center gap-2 text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded w-fit">
                                            <FlaskConical size={14} /> Chem
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded w-fit">
                                            <Box size={14} /> Pack
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-mono font-medium text-slate-700">{product.sku}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{product.tradeName}</td>
                                <td className="px-6 py-4 text-slate-500 text-xs">
                                    {product.inciName && <div><span className="font-semibold">INCI:</span> {product.inciName}</div>}
                                    {product.casNumber && <div><span className="font-semibold">CAS:</span> {product.casNumber}</div>}
                                </td>
                                <td className="px-6 py-4">{product.baseUnit}</td>
                                <td className="px-6 py-4 text-right">{product.minStockLevel}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Add New Material</h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                             <label className="block text-sm font-medium text-slate-700 mb-1">Material Type</label>
                             <div className="flex gap-4">
                                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 flex-1">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value={ProductType.CHEMICAL}
                                        checked={formData.type === ProductType.CHEMICAL}
                                        onChange={() => setFormData({...formData, type: ProductType.CHEMICAL})}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <FlaskConical className="text-purple-500" size={20} />
                                    <span className="font-medium text-slate-700">Chemical Ingredient</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 flex-1">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value={ProductType.PACKAGING}
                                        checked={formData.type === ProductType.PACKAGING}
                                        onChange={() => setFormData({...formData, type: ProductType.PACKAGING})}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <Box className="text-emerald-500" size={20} />
                                    <span className="font-medium text-slate-700">Packaging Material</span>
                                </label>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">SKU Code</label>
                            <input 
                                type="text"
                                placeholder="e.g. CHEM-001"
                                className="w-full border border-slate-300 rounded-md p-2"
                                value={formData.sku}
                                onChange={e => setFormData({...formData, sku: e.target.value})}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Trade Name</label>
                            <input 
                                type="text"
                                placeholder="e.g. Glycerin 99.5%"
                                className="w-full border border-slate-300 rounded-md p-2"
                                value={formData.tradeName}
                                onChange={e => setFormData({...formData, tradeName: e.target.value})}
                                required
                            />
                        </div>

                        {formData.type === ProductType.CHEMICAL && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">INCI Name (Optional)</label>
                                    <input 
                                        type="text"
                                        className="w-full border border-slate-300 rounded-md p-2"
                                        value={formData.inciName}
                                        onChange={e => setFormData({...formData, inciName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">CAS Number (Optional)</label>
                                    <input 
                                        type="text"
                                        className="w-full border border-slate-300 rounded-md p-2"
                                        value={formData.casNumber}
                                        onChange={e => setFormData({...formData, casNumber: e.target.value})}
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Base Unit</label>
                            <select 
                                className="w-full border border-slate-300 rounded-md p-2 bg-white"
                                value={formData.baseUnit}
                                onChange={e => setFormData({...formData, baseUnit: e.target.value as UnitOfMeasure})}
                            >
                                {Object.values(UnitOfMeasure).map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Min Stock Level</label>
                            <input 
                                type="number"
                                className="w-full border border-slate-300 rounded-md p-2"
                                value={formData.minStockLevel}
                                onChange={e => setFormData({...formData, minStockLevel: parseFloat(e.target.value)})}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-slate-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-md hover:bg-slate-800 flex items-center justify-center gap-2 font-medium">
                            <Save size={18} /> Save Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};