import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ReceiveGoodsForm } from './components/ReceiveGoodsForm';
import { GoodsIssueForm } from './components/GoodsIssueForm';
import { InventoryPage } from './components/InventoryPage';
import { ProductMasterPage } from './components/ProductMasterPage';
import { SettingsPage } from './components/SettingsPage';
import { PackageOpen, Cloud, RefreshCw, AlertTriangle, WifiOff } from 'lucide-react';
import { User, Batch, ReceiptFormData, QcStatus, UserRole, Product, Transaction, TransactionType } from './types';
import { dataService } from './services/dataService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // State
  const [inventory, setInventory] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Sync Status State
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Initial Load (Reconstructs Inventory from Transactions)
  useEffect(() => {
    const initData = async () => {
        setSyncStatus('syncing');
        const data = await dataService.load();
        setInventory(data.inventory);
        setProducts(data.products);
        setIsOfflineMode(!!data.isOffline);
        setIsInitialized(true);
        setSyncStatus('idle');
    };
    initData();
  }, []);

  // Default Mock User
  const user: User = {
    id: '1',
    name: 'Demo Admin',
    email: 'admin@chemstock.com',
    role: UserRole.ADMIN,
    initials: 'DA'
  };

  // Helper to refresh state after append
  const refreshData = async () => {
      const data = await dataService.load();
      setInventory(data.inventory);
      setProducts(data.products);
      setIsOfflineMode(!!data.isOffline);
  };

  // Handlers - Now creating Transactions instead of overwriting State
  
  const handleReceiveGoods = async (data: ReceiptFormData) => {
    setSyncStatus('syncing');
    
    const newTx: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        type: TransactionType.RECEIPT,
        referenceNo: 'GR-' + Date.now(),
        productId: parseInt(data.productId),
        lotNumber: data.lotNumber,
        quantity: data.quantity, // POSITIVE
        location: data.location,
        qcStatus: data.qcStatus || QcStatus.QUARANTINE,
        performedBy: user.email,
        mfgDate: data.mfgDate,
        expDate: data.expDate,
        supplier: data.supplier
    };

    try {
        await dataService.addTransaction(newTx);
        await refreshData(); // Reload to see update
        setSyncStatus('success');
    } catch (e) {
        setSyncStatus('error');
    }
  };

  const handleIssueGoods = async (allocations: { batchId: number; deductQty: number }[]) => {
      setSyncStatus('syncing');
      try {
          // Process each deduction as a transaction
          for (const alloc of allocations) {
              const batch = inventory.find(b => b.id === alloc.batchId);
              if (!batch) continue;

              const newTx: Transaction = {
                  id: Date.now().toString() + Math.random(),
                  date: new Date().toISOString().split('T')[0],
                  type: TransactionType.ISSUE,
                  referenceNo: 'GI-' + Date.now(),
                  productId: batch.productId,
                  lotNumber: batch.lotNumber,
                  quantity: alloc.deductQty, // Store as Positive value, logic handles type ISSUE
                  location: batch.location,
                  qcStatus: batch.qcStatus,
                  performedBy: user.email,
                  mfgDate: batch.mfgDate,
                  expDate: batch.expDate
              };
              await dataService.addTransaction(newTx);
          }
          await refreshData();
          setSyncStatus('success');
      } catch (e) {
          setSyncStatus('error');
      }
  };

  const handleAddProduct = async (newProduct: Product) => {
    setSyncStatus('syncing');
    try {
        await dataService.addProduct(newProduct);
        setProducts([...products, newProduct]); // Optimistic update
        await refreshData();
        setSyncStatus('success');
    } catch (e) {
        setSyncStatus('error');
    }
  };

  // Manual Adjustments (from Inventory Page)
  // Since we are Append-Only, "Editing" a batch actually means adding an adjustment transaction
  // But for this prototype UI, it might be complex to explain.
  // For now, let's just log a "Correction" transaction (Adjustment).
  const handleUpdateBatch = async (updatedBatch: Batch) => {
      // Find difference
      const oldBatch = inventory.find(b => b.id === updatedBatch.id);
      if (!oldBatch) return;
      
      const qtyDiff = updatedBatch.quantity - oldBatch.quantity;
      if (qtyDiff !== 0) {
          const tx: Transaction = {
              id: Date.now().toString(),
              date: new Date().toISOString().split('T')[0],
              type: TransactionType.ADJUSTMENT,
              referenceNo: 'ADJ-MANUAL',
              productId: updatedBatch.productId,
              lotNumber: updatedBatch.lotNumber,
              quantity: qtyDiff,
              location: updatedBatch.location,
              qcStatus: updatedBatch.qcStatus,
              performedBy: user.email
          };
          setSyncStatus('syncing');
          await dataService.addTransaction(tx);
          await refreshData();
          setSyncStatus('success');
      }
  };

  // Not implemented in append-only logic perfectly yet, just hide from UI for now or mark 0
  const handleDeleteBatch = async (id: number) => {
      const batch = inventory.find(b => b.id === id);
      if(!batch) return;
      
      const tx: Transaction = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          type: TransactionType.ADJUSTMENT,
          referenceNo: 'DELETE',
          productId: batch.productId,
          lotNumber: batch.lotNumber,
          quantity: -batch.quantity, // Zero it out
          location: batch.location,
          qcStatus: batch.qcStatus,
          performedBy: user.email
      };
      setSyncStatus('syncing');
      await dataService.addTransaction(tx);
      await refreshData();
      setSyncStatus('success');
  };

  // Manual Add Batch from Inventory Page (Treat as Receipt)
  const handleAddManualBatch = (batch: Batch) => {
       const tx: Transaction = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          type: TransactionType.RECEIPT,
          referenceNo: 'MANUAL-ADD',
          productId: batch.productId,
          lotNumber: batch.lotNumber,
          quantity: batch.quantity,
          location: batch.location,
          qcStatus: batch.qcStatus,
          performedBy: user.email,
          mfgDate: batch.mfgDate,
          expDate: batch.expDate
      };
      setSyncStatus('syncing');
      dataService.addTransaction(tx).then(() => {
          refreshData();
          setSyncStatus('success');
      });
  };

  if (!isInitialized) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-slate-50">
              <div className="text-center">
                  <RefreshCw className="animate-spin w-10 h-10 text-primary mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Loading History...</p>
                  <p className="text-xs text-slate-400 mt-2">Connecting to Backend...</p>
              </div>
          </div>
      );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard inventory={inventory} products={products} />;
      case 'receive':
        return <ReceiveGoodsForm onReceive={handleReceiveGoods} products={products} />;
      case 'issue':
        return <GoodsIssueForm inventory={inventory} products={products} onIssue={handleIssueGoods} />;
      case 'inventory':
        return <InventoryPage 
                  inventory={inventory} 
                  products={products}
                  onAdd={handleAddManualBatch} 
                  onUpdate={handleUpdateBatch} 
                  onDelete={handleDeleteBatch} 
               />;
      case 'products':
        return <ProductMasterPage 
                  products={products} 
                  onAddProduct={handleAddProduct} 
               />;
      case 'settings':
        return <SettingsPage 
                  inventory={inventory} 
                  products={products} 
                  onImport={() => {}} 
                  onReset={() => {}} 
               />;
      default:
        return <Dashboard inventory={inventory} products={products} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        user={user}
      />
      <main className="flex-1 overflow-auto h-screen">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
            <h2 className="font-semibold text-slate-700 capitalize">
                {currentPage === 'receive' ? 'Inbound Transaction' : 
                 currentPage === 'issue' ? 'Outbound Transaction' : currentPage}
            </h2>
            <div className="flex items-center gap-6">
                
                {/* Offline Indicator */}
                {isOfflineMode && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200">
                        <WifiOff size={14} />
                        <span>Offline Mode</span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {syncStatus === 'syncing' && <span className="text-xs text-blue-600 animate-pulse flex items-center gap-1"><RefreshCw size={12} className="animate-spin"/> Saving...</span>}
                    {syncStatus === 'success' && <span className="text-xs text-green-600 flex items-center gap-1"><Cloud size={12}/> Synced</span>}
                    {syncStatus === 'error' && <span className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={12}/> Sync Failed</span>}
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-200 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 font-bold">
                        {user.initials}
                    </div>
                </div>
            </div>
        </header>
        <div className="p-2 md:p-6">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;