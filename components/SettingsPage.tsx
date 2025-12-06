import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Batch, Product } from '../types';
import { Download, Upload, Trash2, Database, AlertTriangle, CheckCircle, Cloud } from 'lucide-react';
import { dataService } from '../services/dataService';

interface SettingsPageProps {
  inventory: Batch[];
  products: Product[];
  onImport: (inv: Batch[], prod: Product[]) => void;
  onReset: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ inventory, products, onImport, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleExport = () => {
    dataService.exportToJson(inventory, products);
    setMsg({ type: 'success', text: 'Backup file downloaded successfully.' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await dataService.importFromJson(file);
      onImport(data.inventory, data.products);
      setMsg({ type: 'success', text: 'System data restored successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to import file. Invalid format.' });
    }
    
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setMsg(null), 3000);
  };

  const handleReset = () => {
      if (window.confirm('WARNING: This will permanently delete ALL inventory and product data. This action cannot be undone.\n\nAre you sure you want to proceed?')) {
          onReset();
          setMsg({ type: 'success', text: 'System reset to factory settings.' });
          setTimeout(() => setMsg(null), 3000);
      }
  };

  // Calculate storage usage (approx)
  const dataSize = JSON.stringify({ inventory, products }).length;
  const sizeKB = (dataSize / 1024).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
            <p className="text-slate-500">Manage data, backups, and system preferences.</p>
        </div>

        {msg && (
            <div className={`p-4 rounded-lg flex items-center gap-3 animate-pulse ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                {msg.text}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-t-4 border-t-accent">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Cloud className="text-accent" />
                        <CardTitle>Cloud Simulation (Transfer Data)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-blue-800 text-sm">
                        <p className="font-semibold mb-1">Work from Anywhere</p>
                        <p>Since this is a simulated environment, use <strong>Export</strong> to save your work to a file, send it to your other device, and use <strong>Import</strong> there to continue working.</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleExport}
                            className="w-full py-4 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 font-medium text-slate-700 transition-colors"
                        >
                            <Download size={20} />
                            <div>
                                <span className="block text-left font-bold">Backup / Export Data</span>
                                <span className="block text-left text-xs text-slate-500 font-normal">Download JSON file to this device</span>
                            </div>
                        </button>
                        
                        <div className="relative">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".json"
                                className="hidden"
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-4 px-4 bg-primary text-white rounded-lg hover:bg-slate-800 flex items-center justify-center gap-2 font-medium transition-colors"
                            >
                                <Upload size={20} />
                                <div>
                                    <span className="block text-left font-bold">Restore / Import Data</span>
                                    <span className="block text-left text-xs text-slate-400 font-normal">Upload JSON file from another device</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card className="border-t-4 border-t-slate-400">
                <CardHeader>
                     <div className="flex items-center gap-2">
                        <Database className="text-slate-600" />
                        <CardTitle>Storage Management</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="p-3 bg-white rounded-full shadow-sm">
                            <Database size={24} className="text-slate-500" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Local Browser Storage</p>
                            <p className="text-sm text-slate-500">Currently using approx. <span className="font-mono font-bold">{sizeKB} KB</span></p>
                        </div>
                    </div>

                    <div className="pt-2">
                         <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                            <AlertTriangle size={16} /> Danger Zone
                         </h4>
                         <button 
                            onClick={handleReset}
                            className="w-full py-3 px-4 border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 font-medium transition-colors"
                        >
                            <Trash2 size={18} />
                            Reset / Clear All System Data
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
};