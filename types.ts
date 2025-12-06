// Enums mirroring database constraints
export enum ProductType {
  CHEMICAL = 'CHEMICAL',
  PACKAGING = 'PACKAGING'
}

export enum QcStatus {
  QUARANTINE = 'QUARANTINE',
  RELEASED = 'RELEASED',
  REJECTED = 'REJECTED'
}

export enum UnitOfMeasure {
  KG = 'KG',
  G = 'G',
  L = 'L',
  PCS = 'PCS',
  PACK = 'PACK'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  WAREHOUSE = 'WAREHOUSE',
  QC = 'QC'
}

export enum TransactionType {
    RECEIPT = 'RECEIPT',
    ISSUE = 'ISSUE',
    ADJUSTMENT = 'ADJUSTMENT'
}

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}

export interface Product {
  id: number;
  sku: string;
  tradeName: string;
  inciName?: string;
  casNumber?: string;
  type: ProductType;
  baseUnit: UnitOfMeasure;
  minStockLevel: number;
}

export interface Batch {
  id: number;
  productId: number;
  lotNumber: string;
  mfgDate: string;
  expDate: string;
  qcStatus: QcStatus;
  quantity: number;
  location: string;
  supplier?: string;
}

export interface Transaction {
    id: string;
    date: string;
    type: TransactionType;
    referenceNo: string;
    productId: number;
    lotNumber: string;
    quantity: number; // Positive for IN, Negative for OUT
    location: string;
    qcStatus: QcStatus;
    performedBy: string;
    // Snapshot fields for history
    mfgDate?: string;
    expDate?: string;
    supplier?: string;
}

export interface ReceiptFormData {
  productId: string;
  lotNumber: string;
  supplier: string;
  mfgDate: string;
  expDate: string;
  quantity: number;
  location: string;
  hasCoa: boolean;
  hasMsds: boolean;
  qcStatus?: QcStatus;
  unitCost?: number;
}