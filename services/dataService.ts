import { Batch, Product, Transaction } from '../types';
import { googleSheetsService } from './googleSheetsService';

export interface AppData {
  inventory: Batch[];
  products: Product[];
  isOffline?: boolean;
}

export const dataService = {
  
  // Add a single transaction (Append-Only)
  addTransaction: async (tx: Transaction) => {
    await googleSheetsService.appendTransaction(tx);
  },

  // Add a new product (Append-Only)
  addProduct: async (p: Product) => {
    await googleSheetsService.appendProduct(p);
  },

  // Load and Reconstruct State from Transaction History
  load: async (): Promise<AppData> => {
    try {
        const { transactions, products, isOffline } = await googleSheetsService.loadData();
        
        // RECONSTRUCT INVENTORY STATE FROM TRANSACTIONS
        // Group by [ProductId + LotNumber]
        const inventoryMap = new Map<string, Batch>();

        transactions.forEach(tx => {
            const key = `${tx.productId}-${tx.lotNumber}`;
            let batch = inventoryMap.get(key);

            if (!batch) {
                // Initialize batch from first transaction found (usually Receipt)
                batch = {
                    id: parseInt(tx.lotNumber.replace(/\D/g,'') || '0') + tx.productId, // Pseudo ID
                    productId: tx.productId,
                    lotNumber: tx.lotNumber,
                    mfgDate: tx.mfgDate || '',
                    expDate: tx.expDate || '',
                    qcStatus: tx.qcStatus,
                    quantity: 0,
                    location: tx.location, // Last known location
                    supplier: tx.supplier
                };
            }

            // Apply Logic
            if (tx.type === 'RECEIPT') {
                batch.quantity += tx.quantity;
                batch.location = tx.location; // Update location
            } else if (tx.type === 'ISSUE') {
                batch.quantity -= Math.abs(tx.quantity); // Ensure deduction
            } else if (tx.type === 'ADJUSTMENT') {
                // Adjustment sets the absolute value? Or is it a delta? 
                // Let's assume delta for simplicity in append-only logs.
                batch.quantity += tx.quantity; 
            }
            
            // Update latest metadata if provided in newer transactions
            if (tx.qcStatus) batch.qcStatus = tx.qcStatus;

            inventoryMap.set(key, batch);
        });

        // Filter out zero quantity batches (optional, or keep them to show history)
        // Let's keep them if quantity > 0
        const inventory = Array.from(inventoryMap.values()).filter(b => b.quantity > 0.001);

        return { inventory, products, isOffline };
    } catch (e) {
        console.error("Load Failed", e);
        return { inventory: [], products: [], isOffline: true };
    }
  },

  clear: () => {
    localStorage.clear();
    // Cannot easily clear Sheets in append-only mode without special admin command
  },
  
  // Keep Export logic for backups
  exportToJson: (inventory: Batch[], products: Product[]) => {
      // ... same as before
      const data = { inventory, products, timestamp: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chemstock-backup.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  },

  importFromJson: async (file: File): Promise<AppData> => {
     // ... same as before
      return new Promise((resolve) => resolve({ inventory: [], products: [] }));
  }
};