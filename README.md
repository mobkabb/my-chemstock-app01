# Chemical & Packaging Inventory System Architecture

## 1. Database Schema (PostgreSQL Design)

This schema is designed to handle the complexity of cosmetic manufacturing, specifically tracking Lots, Expiry Dates, and QC Status.

```sql
-- 1. Master Data: Products (Chemicals & Packaging)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    inci_name VARCHAR(255), -- For Chemicals
    cas_number VARCHAR(50), -- For Chemicals
    type VARCHAR(20) NOT NULL CHECK (type IN ('CHEMICAL', 'PACKAGING')),
    base_unit VARCHAR(20) NOT NULL, -- e.g., kg, g, pcs
    min_stock_level DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Storage Locations
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., WH-A-01-02
    description VARCHAR(255),
    is_temperature_controlled BOOLEAN DEFAULT FALSE
);

-- 3. Batches (The core of traceability)
CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    lot_number VARCHAR(100) NOT NULL,
    supplier_id INTEGER, -- Link to a suppliers table
    mfg_date DATE NOT NULL,
    exp_date DATE NOT NULL,
    coa_document_url TEXT, -- Path to uploaded COA
    msds_document_url TEXT, -- Path to uploaded MSDS
    qc_status VARCHAR(20) DEFAULT 'QUARANTINE' CHECK (qc_status IN ('QUARANTINE', 'RELEASED', 'REJECTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, lot_number)
);

-- 4. Inventory Stock (Where is each batch and how much?)
CREATE TABLE stock_balances (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id),
    location_id INTEGER REFERENCES locations(id),
    quantity DECIMAL(12, 4) NOT NULL CHECK (quantity >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, location_id)
);

-- 5. Transactions (Audit Trail)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('RECEIPT', 'ISSUE', 'ADJUSTMENT', 'TRANSFER')),
    reference_no VARCHAR(100), -- PO Number or Production Order No.
    performed_by_user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    batch_id INTEGER REFERENCES batches(id),
    quantity DECIMAL(12, 4) NOT NULL, -- Positive for IN, Negative for OUT
    cost_per_unit DECIMAL(10, 2) -- For valuation
);
```

## 2. User Flow: Production Issue (FEFO Logic)

1.  **Request:** Production creates a "Material Request" for `Formula A`.
2.  **System Calculation:**
    *   System looks up ingredients for `Formula A`.
    *   **FEFO Algorithm:** For each ingredient, query `stock_balances` joined with `batches`.
    *   *Filter:* `qc_status = 'RELEASED'` (Crucial: Cannot use Quarantine stock).
    *   *Sort:* `exp_date ASC` (First Expired, First Out).
3.  **Picking List:** System generates a picking list telling Warehouse exactly which `Batch No.` and `Location` to pick from.
4.  **Execution:** Warehouse scans the specific Lot.
5.  **Deduction:** Stock is deducted from that specific Batch ID.

## 3. Component Structure (Frontend)

*   **Layouts:** `DashboardLayout`, `AuthGuard`.
*   **Core UI (Shadcn Wrappers):** `Button`, `Input`, `Table`, `Badge`, `Card`, `Dialog`.
*   **Domain Components:**
    *   `ExpiryAlertWidget`: Shows items expiring in < 30 days.
    *   `ProductForm`: Creation wizard for Chem/Pack.
    *   `GoodsReceiptForm`: The complex entry form (implemented in this demo).
    *   `StockLevelTable`: Detailed view with drill-down to batches.
    *   `QcStatusToggle`: Only visible to QC role users.
