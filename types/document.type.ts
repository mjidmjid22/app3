// types/document.type.ts

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'select';
  required: boolean;
  options?: string[]; // For select type
  value?: string;
}

export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number; // Percentage
  taxRate?: number; // Percentage
  total: number;
  category?: string;
}

export interface TaxConfiguration {
  id: string;
  name: string;
  rate: number; // Percentage
  isDefault: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'devis' | 'invoice' | 'order_bond';
  customFields: CustomField[];
  defaultTaxRate: number;
  availableTaxRates: TaxConfiguration[];
  companyInfo: CompanyInfo;
  terms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  siret?: string;
  tvaNumber?: string;
}

export interface DocumentData {
  id: string;
  templateId: string;
  type: 'devis' | 'invoice' | 'order_bond';
  number: string;
  date: Date;
  dueDate?: Date;
  
  // Client/Supplier info
  clientName: string;
  clientAddress: string;
  clientPhone?: string;
  clientEmail?: string;
  
  // Items
  items: DocumentItem[];
  
  // Custom fields values
  customFieldValues: { [fieldId: string]: string };
  
  // Calculations
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  
  // Status
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'paid';
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional notes
  notes?: string;
  terms?: string;
}

export interface DocumentCalculations {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  itemTotals: { [itemId: string]: number };
}