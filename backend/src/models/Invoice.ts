import mongoose, { Schema, Document } from 'mongoose';

export interface ILineItem {
  srNo: number;
  description: string;
  indentNo?: string;
  hsnSacNo?: string;
  specifications?: string;
  deliveryDate?: string;
  makeCode?: string;
  qty: number;
  unit: string;
  rate: number;
  discount?: number;
  matValue: number;
  sgstRate?: number;
  sgstAmt?: number;
  cgstRate?: number;
  cgstAmt?: number;
  cessRate?: number;
  cessAmt?: number;
}

export interface ICustomerDetails {
  name: string;
  address: string;
  gstin?: string;
  cellNo?: string;
  state?: string;
  stateCode?: string;
}

export interface IInvoice extends Document {
  billType: string;
  companyName: string;
  companySubtitle: string;
  companyAddress: string;
  companyGstin: string;
  companyPhone: string;
  logoUrl?: string; // Base64 Data URL for custom uploaded logo
  signatureUrl?: string; // Base64 Data URL for custom uploaded digital signature
  
  // Customer Details
  customer: ICustomerDetails;

  // Invoice Metadata
  invoiceNo: string;
  transportMode?: string;
  vehicleNo?: string;
  dateOfSupply?: string;
  placeOfSupply?: string;

  // Items Table
  items: ILineItem[];

  // Footer & Tax Calculations
  totalQty: number;
  totalMatValue: number;
  cgstRate: number;
  cgstAmt: number;
  sgstRate: number;
  sgstAmt: number;
  cessAmt: number;
  totalAmountAfterTax: number;
  rupeesInWords: string;

  // Terms & Conditions
  termsConditions: string[];

  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema<ILineItem>({
  srNo: { type: Number, required: true },
  description: { type: String, required: true },
  indentNo: { type: String, default: '' },
  hsnSacNo: { type: String, default: '' },
  specifications: { type: String, default: '' },
  deliveryDate: { type: String, default: '' },
  makeCode: { type: String, default: '' },
  qty: { type: Number, required: true, default: 1 },
  unit: { type: String, required: true, default: 'NOS' },
  rate: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  matValue: { type: Number, required: true, default: 0 },
  sgstRate: { type: Number, default: 0 },
  sgstAmt: { type: Number, default: 0 },
  cgstRate: { type: Number, default: 0 },
  cgstAmt: { type: Number, default: 0 },
  cessRate: { type: Number, default: 0 },
  cessAmt: { type: Number, default: 0 }
});

const CustomerSchema = new Schema<ICustomerDetails>({
  name: { type: String, default: 'MAA MAHAMAYA INDUSTRIES LTD.' },
  address: { type: String, default: 'R.G. PETA VILLAGE, L.KOTA MANDAL, VIZIANAGARAM DIST - 535161, INDIA' },
  gstin: { type: String, default: '37AADCM5858Q1ZL' },
  cellNo: { type: String, default: 'Email : info@maamahamaya.com' },
  state: { type: String, default: 'ANDHRA PRADESH' },
  stateCode: { type: String, default: '37' }
});

const InvoiceSchema = new Schema<IInvoice>(
  {
    billType: { type: String, default: 'INVOICE BILL' },
    companyName: { type: String, default: 'NANDAN ENTERPRISES (KNA03)' },
    companySubtitle: { type: String, default: 'SUPPLIER & DISTRIBUTOR' },
    companyAddress: { type: String, default: 'GROUND FLOOR, NO.1-1, KOTHAVALSA, BESIDE FLY OVER BRIDGE - 535270, VIZIANAGARAM' },
    companyGstin: { type: String, default: 'GSTIN : 37QDZPK8368B1ZG' },
    companyPhone: { type: String, default: 'GEDELA KOTAMMA, Mo. No. : 8975913610' },
    logoUrl: { type: String, default: '' },
    signatureUrl: { type: String, default: '' },

    customer: { type: CustomerSchema, required: true },

    invoiceNo: { type: String, required: true },
    transportMode: { type: String, default: '' },
    vehicleNo: { type: String, default: '' },
    dateOfSupply: { type: String, default: '' },
    placeOfSupply: { type: String, default: '' },

    items: [LineItemSchema],

    totalQty: { type: Number, default: 0 },
    totalMatValue: { type: Number, default: 0 },
    cgstRate: { type: Number, default: 9 },
    cgstAmt: { type: Number, default: 0 },
    sgstRate: { type: Number, default: 9 },
    sgstAmt: { type: Number, default: 0 },
    cessAmt: { type: Number, default: 0 },
    totalAmountAfterTax: { type: Number, default: 0 },
    rupeesInWords: { type: String, default: '' },

    termsConditions: {
      type: [String],
      default: [
        '1. Goods once sold will not be taken back or Exchange.',
        '2. Goods will be dispatched to outstation, Customer\'s Expense and Risk.',
        '3. Interest 21% will be charged if not paid within 15 days of receipt of material.',
        '4. Subject to Vizianagaram Jurisdiction only.'
      ]
    }
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
