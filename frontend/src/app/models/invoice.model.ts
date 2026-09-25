export interface LineItem {
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

export interface CustomerDetails {
  name: string;
  address: string;
  gstin?: string;
  cellNo?: string;
  state?: string;
  stateCode?: string;
}

export interface Invoice {
  _id?: string;
  billType: string;
  companyName: string;
  companySubtitle: string;
  companyAddress: string;
  companyGstin: string;
  companyPhone: string;
  
  customer: CustomerDetails;

  invoiceNo: string;
  transportMode?: string;
  vehicleNo?: string;
  dateOfSupply?: string;
  placeOfSupply?: string;

  items: LineItem[];

  totalQty: number;
  totalMatValue: number;
  cgstRate: number;
  cgstAmt: number;
  sgstRate: number;
  sgstAmt: number;
  cessAmt: number;
  totalAmountAfterTax: number;
  rupeesInWords: string;

  termsConditions: string[];

  logoUrl?: string;
  signatureUrl?: string;

  createdAt?: string;
  updatedAt?: string;
}

export const SAMPLE_INVOICE_DATA: Invoice = {
  billType: 'INVOICE BILL',
  companyName: 'NANDAN ENTERPRISES (KNA03)',
  companySubtitle: 'SUPPLIER & DISTRIBUTOR',
  companyAddress: 'GROUND FLOOR, NO.1-1, KOTHAVALSA, BESIDE FLY OVER BRIDGE - 535270, VIZIANAGARAM',
  companyGstin: '37QDZPK8368B1ZG',
  companyPhone: '8975913610',
  
  customer: {
    name: 'MAA MAHAMAYA INDUSTRIES LTD.',
    address: 'R.G. PETA VILLAGE, L.KOTA MANDAL, VIZIANAGARAM DIST - 535161, INDIA',
    gstin: '37AADCM5858Q1ZL',
    cellNo: 'Email : info@maamahamaya.com',
    state: 'ANDHRA PRADESH',
    stateCode: '37'
  },

  invoiceNo: 'PL26Y-00059',
  transportMode: 'Road Transport',
  vehicleNo: '',
  dateOfSupply: '15-06-2026',
  placeOfSupply: 'VIZIANAGARAM',

  items: [
    {
      srNo: 1,
      description: 'PVC PIPES 3/4" (SGC06-073)',
      indentNo: 'IK26Y-00061',
      hsnSacNo: '3917',
      specifications: '3M LENGTH',
      deliveryDate: '15-JUN-26',
      makeCode: '',
      qty: 150,
      unit: 'NOS',
      rate: 20.34,
      discount: 0,
      matValue: 3051,
      sgstRate: 9,
      sgstAmt: 274.59,
      cgstRate: 9,
      cgstAmt: 274.59,
      cessRate: 0,
      cessAmt: 0
    },
    {
      srNo: 2,
      description: 'CLAMP (SCH39-001)',
      indentNo: 'IK26Y-00061',
      hsnSacNo: '73079210',
      specifications: '',
      deliveryDate: '15-JUN-26',
      makeCode: '',
      qty: 500,
      unit: 'NO',
      rate: 1.69,
      discount: 0,
      matValue: 845,
      sgstRate: 9,
      sgstAmt: 76.05,
      cgstRate: 9,
      cgstAmt: 76.05,
      cessRate: 0,
      cessAmt: 0
    },
    {
      srNo: 3,
      description: 'S.S. NAIL 1" (SCH29-009)',
      indentNo: 'IK26Y-00061',
      hsnSacNo: '7317',
      specifications: '',
      deliveryDate: '15-JUN-26',
      makeCode: '',
      qty: 200,
      unit: 'NO',
      rate: 0.85,
      discount: 0,
      matValue: 170,
      sgstRate: 9,
      sgstAmt: 15.30,
      cgstRate: 9,
      cgstAmt: 15.30,
      cessRate: 0,
      cessAmt: 0
    },
    {
      srNo: 4,
      description: 'BOX WITH 16 AMP 2POLE MCB (SEZ08-179)',
      indentNo: 'IK26Y-00061',
      hsnSacNo: '8537',
      specifications: '',
      deliveryDate: '15-JUN-26',
      makeCode: '',
      qty: 5,
      unit: 'NOS',
      rate: 84.75,
      discount: 0,
      matValue: 423.75,
      sgstRate: 9,
      sgstAmt: 38.14,
      cgstRate: 9,
      cgstAmt: 38.14,
      cessRate: 0,
      cessAmt: 0
    },
    {
      srNo: 5,
      description: 'SOCKET 6 AMP 5 PIN (SEL17-012)',
      indentNo: 'IK26Y-00061',
      hsnSacNo: '8536',
      specifications: '',
      deliveryDate: '15-JUN-26',
      makeCode: '',
      qty: 100,
      unit: 'NO',
      rate: 46.61,
      discount: 0,
      matValue: 4661,
      sgstRate: 9,
      sgstAmt: 419.49,
      cgstRate: 9,
      cgstAmt: 419.49,
      cessRate: 0,
      cessAmt: 0
    },
    {
      srNo: 6,
      description: 'COPPER CABLE 1.5 SQ.MM X 1 CORE (EC082-040)',
      indentNo: 'IK26Y-00061',
      hsnSacNo: '8544',
      specifications: '',
      deliveryDate: '15-JUN-26',
      makeCode: '',
      qty: 300,
      unit: 'MTR',
      rate: 24.58,
      discount: 0,
      matValue: 7374,
      sgstRate: 9,
      sgstAmt: 663.66,
      cgstRate: 9,
      cgstAmt: 663.66,
      cessRate: 0,
      cessAmt: 0
    },
    {
      srNo: 7,
      description: 'COPPER CABLE 2.5 SQ.MM X 1CORE (180MTR) (SEC07-004)',
      indentNo: 'IK26Y-00061',
      hsnSacNo: '8544',
      specifications: '',
      deliveryDate: '15-JUN-26',
      makeCode: '',
      qty: 200,
      unit: 'MTR',
      rate: 42.37,
      discount: 0,
      matValue: 8474,
      sgstRate: 9,
      sgstAmt: 762.66,
      cgstRate: 9,
      cgstAmt: 762.66,
      cessRate: 0,
      cessAmt: 0
    },
    {
      srNo: 8,
      description: 'BLANK PLATE SINGLE (SEL09-007)',
      indentNo: 'IK26Y-00061',
      hsnSacNo: '8538',
      specifications: '',
      deliveryDate: '15-JUN-26',
      makeCode: '',
      qty: 100,
      unit: 'NO',
      rate: 4.66,
      discount: 0,
      matValue: 466,
      sgstRate: 9,
      sgstAmt: 41.94,
      cgstRate: 9,
      cgstAmt: 41.94,
      cessRate: 0,
      cessAmt: 0
    }
  ],

  totalQty: 1555,
  totalMatValue: 25464.75,
  cgstRate: 9,
  cgstAmt: 2291.83,
  sgstRate: 9,
  sgstAmt: 2291.83,
  cessAmt: 0,
  totalAmountAfterTax: 30048.41,
  rupeesInWords: 'Thirty Thousand Forty Eight Rupees and Forty One Paise Only',

  termsConditions: [
    '1. Goods once sold will not be taken back or Exchange.',
    '2. Goods will be dispatched to outstation, Customer\'s Expense and Risk.',
    '3. Interest 21% will be charged if not paid within 15 days of receipt of material.',
    '4. Subject to Vizianagaram Jurisdiction only.'
  ]
};
