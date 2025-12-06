import { Product, Transaction, TransactionType, QcStatus } from '../types';

// --- CONFIGURATION ---
const API_URL = 'http://localhost:3001/api';
const LOCAL_KEY_TX = 'chemstock_transactions_offline';
const LOCAL_KEY_PROD = 'chemstock_products_offline';

// --- MAIN SERVICE ---
export const googleSheetsService = {
    
    // 1. APPEND Transaction
    appendTransaction: async (tx: Transaction) => {
        try {
            // Try Backend First
            const res = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: tx.date, type: tx.type, ref: tx.referenceNo, 
                    pid: tx.productId, lot: tx.lotNumber, qty: tx.quantity, 
                    loc: tx.location, status: tx.qcStatus, user: tx.performedBy,
                    mfg: tx.mfgDate, exp: tx.expDate, sup: tx.supplier
                })
            });
            if (!res.ok) throw new Error("Backend save failed.");
        } catch (e) {
            console.warn("Backend unavailable, saving to LocalStorage (Offline Mode)");
            // Fallback: Save to LocalStorage
            const stored = localStorage.getItem(LOCAL_KEY_TX);
            const txs = stored ? JSON.parse(stored) : [];
            txs.push(tx);
            localStorage.setItem(LOCAL_KEY_TX, JSON.stringify(txs));
        }
    },

    // 2. APPEND Product
    appendProduct: async (p: Product) => {
        try {
             const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p)
            });
            if (!res.ok) throw new Error("Backend save failed.");
        } catch (e) {
            console.warn("Backend unavailable, saving to LocalStorage (Offline Mode)");
            // Fallback: Save to LocalStorage
            const stored = localStorage.getItem(LOCAL_KEY_PROD);
            const prods = stored ? JSON.parse(stored) : [];
            prods.push(p);
            localStorage.setItem(LOCAL_KEY_PROD, JSON.stringify(prods));
        }
    },

    // 3. LOAD All Data (Reconstruct State)
    loadData: async (): Promise<{ transactions: Transaction[], products: Product[], isOffline: boolean }> => {
        try {
            const res = await fetch(`${API_URL}/data`);
            if (!res.ok) throw new Error("Server not reachable");
            const data = await res.json();
            
            // On successful sync, return server data
            return {
                ...parseRawData(data.transactions, data.products),
                isOffline: false
            };

        } catch (e) {
            // Quietly fall back to offline mode without crashing the app
            console.log("Backend connection failed. Switching to Offline Mode.");
            
            // Fallback: Load from LocalStorage
            const storedTx = localStorage.getItem(LOCAL_KEY_TX);
            const storedProd = localStorage.getItem(LOCAL_KEY_PROD);

            return {
                transactions: storedTx ? JSON.parse(storedTx) : [],
                products: storedProd ? JSON.parse(storedProd) : [],
                isOffline: true
            };
        }
    }
};

function parseRawData(txRows: any[], prodRows: any[]) {
    if (!txRows) txRows = [];
    if (!prodRows) prodRows = [];

    const transactions: Transaction[] = txRows.map(row => ({
        id: row[0], date: row[1], type: row[2] as TransactionType, referenceNo: row[3],
        productId: Number(row[4]), lotNumber: row[5], quantity: Number(row[6]),
        location: row[7], qcStatus: row[8] as QcStatus, performedBy: row[9],
        mfgDate: row[10], expDate: row[11], supplier: row[12]
    }));

    const products: Product[] = prodRows.map(row => ({
        id: Number(row[0]), sku: row[1], tradeName: row[2], type: row[3] as any,
        baseUnit: row[4] as any, minStockLevel: Number(row[5]),
        inciName: row[6], casNumber: row[7]
    }));

    return { transactions, products };
}