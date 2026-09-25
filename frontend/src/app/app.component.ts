import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Invoice, LineItem, SAMPLE_INVOICE_DATA } from './models/invoice.model';
import { InvoiceService } from './services/invoice.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Nandan Enterprises Cash/Credit Bill Generator';
  activeTab: 'form' | 'list' = 'form';

  invoices: Invoice[] = [];
  editingId: string | null = null;
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  // PDF Modal State
  showPdfModal: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfTitle: string = 'Invoice Preview';

  // Drag & Drop Logo & Signature Upload State
  isDragging: boolean = false;
  isDraggingSignature: boolean = false;

  // Active Invoice Form Data
  invoice: Invoice = this.getEmptyInvoice();

  constructor(
    private invoiceService: InvoiceService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  getEmptyInvoice(): Invoice {
    return {
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
      dateOfSupply: new Date().toLocaleDateString('en-GB'),
      placeOfSupply: 'VIZIANAGARAM',
      items: [
        this.getEmptyLineItem(1)
      ],
      totalQty: 0,
      totalMatValue: 0,
      cgstRate: 9,
      cgstAmt: 0,
      sgstRate: 9,
      sgstAmt: 0,
      cessAmt: 0,
      totalAmountAfterTax: 0,
      rupeesInWords: '',
      termsConditions: [
        '1. Goods once sold will not be taken back or Exchange.',
        '2. Goods will be dispatched to outstation, Customer\'s Expense and Risk.',
        '3. Interest 21% will be charged if not paid within 15 days of receipt of material.',
        '4. Subject to Vizianagaram Jurisdiction only.'
      ]
    };
  }

  getEmptyLineItem(srNo: number): LineItem {
    return {
      srNo,
      description: '',
      indentNo: '',
      hsnSacNo: '',
      specifications: '',
      deliveryDate: new Date().toLocaleDateString('en-GB'),
      makeCode: '',
      qty: 1,
      unit: 'NOS',
      rate: 0,
      discount: 0,
      matValue: 0,
      sgstRate: 9,
      sgstAmt: 0,
      cgstRate: 9,
      cgstAmt: 0,
      cessRate: 0,
      cessAmt: 0
    };
  }

  // Load sample data preset
  loadSampleData(): void {
    this.invoice = JSON.parse(JSON.stringify(SAMPLE_INVOICE_DATA));
    this.editingId = null;
    this.recalculateTotals();
    this.showSuccess('Nandan Enterprises Bill sample data loaded!');
  }

  calculateItem(item: LineItem): void {
    const qty = Number(item.qty || 0);
    const rate = Number(item.rate || 0);
    const discount = Number(item.discount || 0);

    item.matValue = Math.max(0, qty * rate - discount);

    const sgstR = Number(item.sgstRate ?? 9);
    const cgstR = Number(item.cgstRate ?? 9);
    const cessR = Number(item.cessRate ?? 0);

    item.sgstAmt = Number(((item.matValue * sgstR) / 100).toFixed(2));
    item.cgstAmt = Number(((item.matValue * cgstR) / 100).toFixed(2));
    item.cessAmt = Number(((item.matValue * cessR) / 100).toFixed(2));

    this.recalculateTotals();
  }

  recalculateTotals(): void {
    let qtySum = 0;
    let matValSum = 0;
    let sgstSum = 0;
    let cgstSum = 0;
    let cessSum = 0;

    this.invoice.items.forEach((item, index) => {
      item.srNo = index + 1;
      qtySum += Number(item.qty || 0);
      matValSum += Number(item.matValue || 0);
      sgstSum += Number(item.sgstAmt || 0);
      cgstSum += Number(item.cgstAmt || 0);
      cessSum += Number(item.cessAmt || 0);
    });

    this.invoice.totalQty = qtySum;
    this.invoice.totalMatValue = Number(matValSum.toFixed(2));
    this.invoice.cgstAmt = Number(cgstSum.toFixed(2));
    this.invoice.sgstAmt = Number(sgstSum.toFixed(2));
    this.invoice.cessAmt = Number(cessSum.toFixed(2));

    this.invoice.totalAmountAfterTax = Number((matValSum + sgstSum + cgstSum + cessSum).toFixed(2));
    this.invoice.rupeesInWords = this.numberToWords(this.invoice.totalAmountAfterTax);
  }

  addItem(): void {
    const nextSr = this.invoice.items.length + 1;
    this.invoice.items.push(this.getEmptyLineItem(nextSr));
    this.recalculateTotals();
  }

  removeItem(index: number): void {
    if (this.invoice.items.length > 1) {
      this.invoice.items.splice(index, 1);
      this.recalculateTotals();
    } else {
      this.showError('Invoice must have at least one line item.');
    }
  }

  loadInvoices(): void {
    this.loading = true;
    this.invoiceService.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
      },
      error: () => {
        this.showError('Failed to load saved invoices.');
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.invoice.invoiceNo) {
      this.showError('Please enter an Invoice Number.');
      return;
    }
    if (!this.invoice.customer || !this.invoice.customer.name) {
      this.showError('Please enter Customer Name.');
      return;
    }

    this.recalculateTotals();
    this.loading = true;

    if (this.editingId) {
      this.invoiceService.updateInvoice(this.editingId, this.invoice).subscribe({
        next: () => {
          this.showSuccess('Invoice updated successfully!');
          this.editingId = null;
          this.loadInvoices();
          this.loading = false;
        },
        error: (err) => {
          this.showError('Failed to update invoice: ' + err.message);
          this.loading = false;
        }
      });
    } else {
      this.invoiceService.createInvoice(this.invoice).subscribe({
        next: () => {
          this.showSuccess('Invoice saved to MongoDB!');
          this.loadInvoices();
          this.loading = false;
        },
        error: (err) => {
          this.showError('Failed to save invoice: ' + err.message);
          this.loading = false;
        }
      });
    }
  }

  editInvoice(inv: Invoice): void {
    this.invoice = JSON.parse(JSON.stringify(inv));
    this.editingId = inv._id || null;
    this.activeTab = 'form';
    this.showSuccess(`Editing Invoice: ${inv.invoiceNo}`);
  }

  deleteInvoice(id: string | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.invoiceService.deleteInvoice(id).subscribe({
        next: () => {
          this.showSuccess('Invoice deleted.');
          this.loadInvoices();
        },
        error: () => this.showError('Failed to delete invoice.')
      });
    }
  }

  onPreviewPdf(): void {
    this.recalculateTotals();
    this.loading = true;
    this.invoiceService.previewPdf(this.invoice).subscribe({
      next: (blob) => {
        const fileUrl = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
        this.pdfTitle = `Preview: ${this.invoice.invoiceNo || 'New Bill'}`;
        this.showPdfModal = true;
        this.loading = false;
      },
      error: () => {
        this.showError('Failed to generate PDF preview.');
        this.loading = false;
      }
    });
  }

  downloadPdf(inv: Invoice): void {
    if (!inv._id) return;
    this.invoiceService.downloadPdf(inv._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bill_${inv.invoiceNo.replace(/\//g, '_')}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.showError('Failed to download PDF.')
    });
  }

  resetForm(): void {
    this.invoice = this.getEmptyInvoice();
    this.editingId = null;
    this.showSuccess('Form cleared.');
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Terms and Conditions Handlers
  addTerm(): void {
    if (!this.invoice.termsConditions) {
      this.invoice.termsConditions = [];
    }
    this.invoice.termsConditions.push('');
  }

  removeTerm(index: number): void {
    if (this.invoice.termsConditions && this.invoice.termsConditions.length > 0) {
      this.invoice.termsConditions.splice(index, 1);
    }
  }

  // Drag and Drop Logo Upload Handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processLogoFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processLogoFile(input.files[0]);
    }
  }

  private processLogoFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.showError('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }
    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      this.showError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.invoice.logoUrl = e.target?.result as string;
      this.showSuccess('Company logo uploaded successfully!');
    };
    reader.onerror = () => {
      this.showError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.invoice.logoUrl = undefined;
    this.showSuccess('Company logo removed.');
  }

  // Drag and Drop Digital Signature Handlers
  onSigDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingSignature = true;
  }

  onSigDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingSignature = false;
  }

  onSigDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingSignature = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processSigFile(files[0]);
    }
  }

  onSigFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processSigFile(input.files[0]);
    }
  }

  private processSigFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.showError('Please upload a valid signature image (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showError('Signature image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.invoice.signatureUrl = e.target?.result as string;
      this.showSuccess('Digital signature uploaded successfully!');
    };
    reader.onerror = () => {
      this.showError('Failed to read signature image.');
    };
    reader.readAsDataURL(file);
  }

  removeSignature(): void {
    this.invoice.signatureUrl = undefined;
    this.showSuccess('Digital signature removed.');
  }

  closeModal(): void {
    this.showPdfModal = false;
    this.pdfUrl = null;
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 4000);
  }

  showError(msg: string): void {
    this.errorMessage = msg;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 5000);
  }

  // Number to Indian Rupees Words
  private numberToWords(amount: number): string {
    if (isNaN(amount) || amount === 0) return 'Zero Rupees Only';

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (num: number): string => {
      if ((num = num.toString() as any).length > 9) return 'overflow';
      const n: any = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return '';
      let str = '';
      str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
      str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
      str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
      str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
      str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
      return str;
    };

    const parts = amount.toFixed(2).split('.');
    const rupees = parseInt(parts[0], 10);
    const paise = parseInt(parts[1], 10);

    let result = '';
    if (rupees > 0) {
      result += inWords(rupees) + 'Rupees ';
    }
    if (paise > 0) {
      result += (result ? 'and ' : '') + inWords(paise) + 'Paise ';
    }
    return result.trim() + ' Only';
  }
}
