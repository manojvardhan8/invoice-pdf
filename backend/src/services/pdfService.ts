import PDFDocument from 'pdfkit';
import { IInvoice, ILineItem, ICustomerDetails } from '../models/Invoice';

interface ColumnDef {
  id: string;
  title: string;
  width: number;
  align: 'left' | 'center' | 'right';
}

/**
 * Converts numeric amount to Indian Rupees in Words automatically
 */
function numberToWords(amount: number): string {
  if (isNaN(amount) || amount <= 0) return 'Zero Rupees Only';

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

  const parts = Number(amount).toFixed(2).split('.');
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

/**
 * Generates a PDF buffer with support for custom uploaded logo images!
 */
export function generateInvoicePDF(invoice: Partial<IInvoice>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 20, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2; // 555.28 pt

      // Document Outer Frame Border
      doc.rect(margin, margin, contentWidth, pageHeight - margin * 2).stroke('#000000');

      let y = margin;

      // --- 1. HEADER SECTION ---
      const headerHeight = 70;
      doc.rect(margin, y, contentWidth, headerHeight).stroke('#000000');

      // Top Center Italic: INVOICE BILL
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#000000')
         .text(invoice.billType || 'INVOICE BILL', margin, y + 4, { width: contentWidth, align: 'center' });

      // Left Logo / Emblem Box
      const leftEmblemX = margin + 12;
      const emblemY = y + 8;

      let hasCustomLogo = false;
      if (invoice.logoUrl && invoice.logoUrl.startsWith('data:image/')) {
        try {
          const base64Data = invoice.logoUrl.replace(/^data:image\/\w+;base64,/, '');
          const logoBuffer = Buffer.from(base64Data, 'base64');
          doc.image(logoBuffer, leftEmblemX, emblemY, { fit: [42, 40], align: 'center', valign: 'center' });
          hasCustomLogo = true;
        } catch (e) {
          hasCustomLogo = false;
        }
      }

      if (!hasCustomLogo) {
        doc.save();
        doc.roundedRect(leftEmblemX, emblemY, 40, 40, 6).lineWidth(1.5).stroke('#000000');
        doc.roundedRect(leftEmblemX + 2, emblemY + 2, 36, 36, 4).fillAndStroke('#0f172a', '#0f172a');
        doc.font('Helvetica-Bold').fontSize(16).fillColor('#ffffff')
           .text('NE', leftEmblemX + 2, emblemY + 11, { width: 36, align: 'center' });
        doc.restore();
      }

      // Center Title & Details (NANDAN ENTERPRISES)
      doc.font('Helvetica-Bold').fontSize(17).text(invoice.companyName || 'NANDAN ENTERPRISES (KNA03)', margin + 50, y + 14, {
        width: contentWidth - 100,
        align: 'center'
      });

      doc.font('Helvetica-Bold').fontSize(8.5).text(invoice.companySubtitle || 'SUPPLIER & DISTRIBUTOR', margin + 50, y + 34, {
        width: contentWidth - 100,
        align: 'center'
      });

      doc.font('Helvetica').fontSize(7.5).text(invoice.companyAddress || 'GROUND FLOOR, NO.1-1, KOTHAVALSA, BESIDE FLY OVER BRIDGE - 535270, VIZIANAGARAM', margin + 50, y + 45, {
        width: contentWidth - 100,
        align: 'center'
      });

      // Bottom Row of Header: GSTIN left, Phone right
      const rawGstin = (invoice.companyGstin || '37QDZPK8368B1ZG').trim();
      const displayGstin = rawGstin.toUpperCase().startsWith('GSTIN') ? rawGstin : `GSTIN : ${rawGstin}`;

      const rawPhone = (invoice.companyPhone || '8975913610').trim();
      let displayPhone = rawPhone;
      if (!rawPhone.includes('Contact No.') && !rawPhone.includes('Contact') && !rawPhone.includes('Mo.') && !rawPhone.includes('Cell') && !rawPhone.includes('Phone')) {
        displayPhone = `Contact No. : ${rawPhone}`;
      } else if (rawPhone.includes('Mo. No.')) {
        displayPhone = rawPhone.replace(/Mo\. No\./g, 'Contact No.');
      }

      doc.font('Helvetica-Bold').fontSize(8.5).text(displayGstin, margin + 8, y + 56);
      doc.font('Helvetica-Bold').fontSize(8.5).text(displayPhone, margin + 220, y + 56, { width: contentWidth - 228, align: 'right' });

      y += headerHeight;

      // --- 2. CUSTOMER & INVOICE METADATA ---
      const infoBoxHeight = 85;
      const colWidth = contentWidth / 2;

      doc.rect(margin, y, colWidth, infoBoxHeight).stroke('#000000');
      doc.rect(margin + colWidth, y, colWidth, infoBoxHeight).stroke('#000000');

      // Left Box: Customer Details
      const cust: Partial<ICustomerDetails> = invoice.customer || {};
      let bx = margin + 6;
      let by = y + 5;
      doc.font('Helvetica-Bold').fontSize(8).text('Name :', bx, by);
      doc.font('Helvetica-Bold').fontSize(8).text(cust.name || 'MAA MAHAMAYA INDUSTRIES LTD.', bx + 42, by, { width: colWidth - 52 });

      doc.font('Helvetica-Bold').fontSize(8).text('Address :', bx, by + 14);
      doc.font('Helvetica').text(cust.address || 'R.G. PETA VILLAGE, L.KOTA MANDAL, VIZIANAGARAM DIST - 535161, INDIA', bx + 45, by + 14, { width: colWidth - 55, height: 22 });

      doc.font('Helvetica-Bold').fontSize(8).text('GST IN :', bx, by + 38);
      doc.font('Helvetica').text(cust.gstin || '37AADCM5858Q1ZL', bx + 42, by + 38);

      doc.font('Helvetica-Bold').fontSize(8).text('Contact :', bx, by + 50);
      doc.font('Helvetica').text(cust.cellNo || 'Email : info@maamahamaya.com', bx + 42, by + 50);

      doc.font('Helvetica-Bold').fontSize(8).text('State :', bx, by + 63);
      doc.font('Helvetica').text(cust.state || 'ANDHRA PRADESH', bx + 35, by + 63);

      doc.font('Helvetica-Bold').fontSize(8).text('State Code :', bx + 155, by + 63);
      doc.font('Helvetica').fontSize(8).text(cust.stateCode || '37', bx + 212, by + 63);

      // Right Box: Invoice Metadata
      bx = margin + colWidth + 6;
      doc.font('Helvetica-Bold').fontSize(8).text('Invoice No. :', bx, by + 6);
      doc.font('Helvetica').text(invoice.invoiceNo || 'PL26Y-00059', bx + 65, by + 6);

      doc.font('Helvetica-Bold').fontSize(8).text('Transportation Mode :', bx, by + 24);
      doc.font('Helvetica').text(invoice.transportMode || 'Road Transport', bx + 102, by + 24);

      doc.font('Helvetica-Bold').fontSize(8).text('Date of Supply :', bx, by + 42);
      doc.font('Helvetica').text(invoice.dateOfSupply || '15-06-2026', bx + 75, by + 42);

      doc.font('Helvetica-Bold').fontSize(8).text('Place of Supply :', bx, by + 60);
      doc.font('Helvetica').text(invoice.placeOfSupply || 'VIZIANAGARAM', bx + 78, by + 60);

      y += infoBoxHeight;

      // --- 3. ITEMS TABLE ---
      const cols: ColumnDef[] = [
        { id: 'sr', title: 'Sr.\nNo.', width: 22, align: 'center' },
        { id: 'desc', title: 'Description of Goods', width: 140, align: 'left' },
        { id: 'make', title: 'Make\nCode', width: 30, align: 'center' },
        { id: 'qty', title: 'Order\nQty', width: 32, align: 'right' },
        { id: 'unit', title: 'Unit', width: 25, align: 'center' },
        { id: 'rate', title: 'Rate (per\nunit) (INR)', width: 45, align: 'right' },
        { id: 'taxVal', title: 'Mat. Value /\nTax on Amount', width: 55, align: 'right' },
        { id: 'sgstRate', title: 'SGST\nRate', width: 28, align: 'right' },
        { id: 'sgstAmt', title: 'SGST\nAmt.', width: 45, align: 'right' },
        { id: 'cgstRate', title: 'CGST\nRate', width: 28, align: 'right' },
        { id: 'cgstAmt', title: 'CGST\nAmt.', width: 45, align: 'right' },
        { id: 'cessAmt', title: 'CESS\nAmt.', width: 35, align: 'right' }
      ];

      const headerHeightCol = 28;
      doc.rect(margin, y, contentWidth, headerHeightCol).fillAndStroke('#f2f2f2', '#000000');

      let currentX = margin;
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5);

      cols.forEach((col, idx) => {
        if (idx > 0) {
          doc.moveTo(currentX, y).lineTo(currentX, y + headerHeightCol).stroke('#000000');
        }
        doc.text(col.title, currentX + 1, y + 4, {
          width: col.width - 2,
          align: col.align
        });
        currentX += col.width;
      });

      y += headerHeightCol;

      // Render Item Rows
      const items: ILineItem[] = invoice.items || [];
      let totalQtySum = 0;
      let totalMatValSum = 0;
      let totalSgstSum = 0;
      let totalCgstSum = 0;
      let totalCessSum = 0;

      items.forEach((item, index) => {
        doc.font('Helvetica-Bold').fontSize(6);
        const titleHeightCalc = doc.heightOfString(item.description || '', { width: 136 });
        let subHeightCalc = 0;
        if (item.indentNo) subHeightCalc += 8;
        if (item.hsnSacNo) subHeightCalc += 8;
        if (item.specifications) subHeightCalc += 8;
        if (item.deliveryDate) subHeightCalc += 8;

        const rowHeight = Math.max(40, titleHeightCalc + subHeightCalc + 8);

        if (y + rowHeight > pageHeight - 190) {
          doc.addPage();
          y = margin;
        }

        doc.rect(margin, y, contentWidth, rowHeight).stroke('#000000');

        let cellX = margin;
        cols.forEach((col, cIdx) => {
          if (cIdx > 0) {
            doc.moveTo(cellX, y).lineTo(cellX, y + rowHeight).stroke('#000000');
          }

          doc.font('Helvetica').fontSize(6).fillColor('#000000');

          if (col.id === 'sr') {
            doc.text(`${item.srNo || index + 1}`, cellX + 1, y + 4, { width: col.width - 2, align: 'center' });
          } else if (col.id === 'desc') {
            doc.font('Helvetica-Bold').fontSize(6).text(item.description || '', cellX + 2, y + 3, { width: col.width - 4 });
            const titleH = doc.heightOfString(item.description || '', { width: col.width - 4 });
            let subY = y + 3 + titleH + 2;

            doc.font('Helvetica').fontSize(5.5);
            if (item.indentNo) {
              doc.text(`Indent No. : ${item.indentNo}`, cellX + 2, subY, { width: col.width - 4 });
              subY += 8;
            }
            if (item.hsnSacNo) {
              doc.text(`HSN/SAC No. : ${item.hsnSacNo}`, cellX + 2, subY, { width: col.width - 4 });
              subY += 8;
            }
            if (item.specifications) {
              doc.text(item.specifications, cellX + 2, subY, { width: col.width - 4 });
              subY += 8;
            }
            if (item.deliveryDate) {
              doc.text(`Delivery Date : ${item.deliveryDate}`, cellX + 2, subY, { width: col.width - 4 });
            }
          } else if (col.id === 'make') {
            doc.text(item.makeCode || '', cellX + 1, y + 4, { width: col.width - 2, align: 'center' });
          } else if (col.id === 'qty') {
            doc.text(`${item.qty ?? 0}`, cellX + 1, y + 4, { width: col.width - 2, align: 'right' });
          } else if (col.id === 'unit') {
            doc.text(item.unit || '', cellX + 1, y + 4, { width: col.width - 2, align: 'center' });
          } else if (col.id === 'rate') {
            doc.text(Number(item.rate || 0).toFixed(2), cellX + 1, y + 4, { width: col.width - 2, align: 'right' });
          } else if (col.id === 'taxVal') {
            doc.text(Number(item.matValue || 0).toFixed(2), cellX + 1, y + 4, { width: col.width - 2, align: 'right' });
          } else if (col.id === 'sgstRate') {
            doc.text(`${item.sgstRate ?? 0}%`, cellX + 1, y + 4, { width: col.width - 2, align: 'right' });
          } else if (col.id === 'sgstAmt') {
            doc.text(Number(item.sgstAmt || 0).toFixed(2), cellX + 1, y + 4, { width: col.width - 2, align: 'right' });
          } else if (col.id === 'cgstRate') {
            doc.text(`${item.cgstRate ?? 0}%`, cellX + 1, y + 4, { width: col.width - 2, align: 'right' });
          } else if (col.id === 'cgstAmt') {
            doc.text(Number(item.cgstAmt || 0).toFixed(2), cellX + 1, y + 4, { width: col.width - 2, align: 'right' });
          } else if (col.id === 'cessAmt') {
            doc.text(Number(item.cessAmt || 0).toFixed(2), cellX + 1, y + 4, { width: col.width - 2, align: 'right' });
          }

          cellX += col.width;
        });

        totalQtySum += Number(item.qty || 0);
        totalMatValSum += Number(item.matValue || 0);
        totalSgstSum += Number(item.sgstAmt || 0);
        totalCgstSum += Number(item.cgstAmt || 0);
        totalCessSum += Number(item.cessAmt || 0);

        y += rowHeight;
      });

      // Table Footer TOTAL Row
      const totalRowHeight = 18;
      doc.rect(margin, y, contentWidth, totalRowHeight).fillAndStroke('#f7f7f7', '#000000');

      let totX = margin;
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(7);

      cols.forEach((col, idx) => {
        if (idx > 0) {
          doc.moveTo(totX, y).lineTo(totX, y + totalRowHeight).stroke('#000000');
        }

        if (col.id === 'sr') {
          doc.text('Total :', totX + 2, y + 5, { width: cols[0].width + cols[1].width + cols[2].width - 4, align: 'right' });
        } else if (col.id === 'qty') {
          doc.text(`${invoice.totalQty || totalQtySum}`, totX + 1, y + 5, { width: col.width - 2, align: 'right' });
        } else if (col.id === 'taxVal') {
          doc.text(Number(invoice.totalMatValue || totalMatValSum).toFixed(2), totX + 1, y + 5, { width: col.width - 2, align: 'right' });
        } else if (col.id === 'sgstAmt') {
          doc.text(Number(totalSgstSum).toFixed(2), totX + 1, y + 5, { width: col.width - 2, align: 'right' });
        } else if (col.id === 'cgstAmt') {
          doc.text(Number(totalCgstSum).toFixed(2), totX + 1, y + 5, { width: col.width - 2, align: 'right' });
        } else if (col.id === 'cessAmt') {
          doc.text(Number(totalCessSum).toFixed(2), totX + 1, y + 5, { width: col.width - 2, align: 'right' });
        }

        totX += col.width;
      });

      y += totalRowHeight;

      // --- 4. FOOTER & TAX BREAKDOWN ---
      const matValueTotal = invoice.totalMatValue || totalMatValSum;
      const sgstValueTotal = invoice.sgstAmt || totalSgstSum;
      const cgstValueTotal = invoice.cgstAmt || totalCgstSum;
      const finalGrandTotal = invoice.totalAmountAfterTax || (matValueTotal + sgstValueTotal + cgstValueTotal + totalCessSum);
      const autoRupeesInWords = numberToWords(finalGrandTotal);

      // 4A. Rupees in Words Row
      const wordsRowHeight = 22;
      doc.rect(margin, y, contentWidth, wordsRowHeight).stroke('#000000');
      doc.font('Helvetica-Bold').fontSize(8.5).text('Rupees in words :', margin + 6, y + 5);
      doc.font('Helvetica-Bold').fontSize(8.5).text(invoice.rupeesInWords || autoRupeesInWords, margin + 95, y + 5, { width: contentWidth - 105 });

      y += wordsRowHeight;

      // 4B. Left Column (Terms & Conditions) & Right Column (Tax Summary Box)
      const footerBoxHeight = 115;
      const leftColWidth = 320;
      const rightColWidth = contentWidth - leftColWidth;

      doc.rect(margin, y, leftColWidth, footerBoxHeight).stroke('#000000');
      doc.rect(margin + leftColWidth, y, rightColWidth, footerBoxHeight).stroke('#000000');

      // Terms & Conditions
      let fy = y + 8;
      doc.font('Helvetica-Bold').fontSize(8.5).text('Terms & Conditions :', margin + 8, fy);

      const terms = invoice.termsConditions && invoice.termsConditions.length > 0 ? invoice.termsConditions : [
        '1. Goods once sold will not be taken back or Exchange.',
        '2. Goods will be dispatched to outstation, Customer\'s Expense and Risk.',
        '3. Interest 21% will be charged if not paid within 15 days of receipt of material.',
        '4. Subject to Vizianagaram Jurisdiction only.'
      ];

      doc.font('Helvetica').fontSize(7.5);
      terms.forEach((term, idx) => {
        doc.text(term, margin + 8, fy + 16 + (idx * 14), { width: leftColWidth - 16 });
      });

      // Right Column: Tax Breakdown Box
      const rightX = margin + leftColWidth;
      const taxRowH = 22;

      doc.rect(rightX, y, rightColWidth, taxRowH).stroke('#000000');
      doc.rect(rightX, y + taxRowH, rightColWidth, taxRowH).stroke('#000000');
      doc.rect(rightX, y + taxRowH * 2, rightColWidth, taxRowH).stroke('#000000');
      doc.rect(rightX, y + taxRowH * 3, rightColWidth, taxRowH + 27).stroke('#000000');

      // Row 1: Total value before Tax
      doc.font('Helvetica-Bold').fontSize(8).text('Total value before Tax :', rightX + 6, y + 6);
      doc.text(Number(matValueTotal).toFixed(2), rightX + rightColWidth - 75, y + 6, { width: 70, align: 'right' });

      // Row 2: Add CGST
      doc.font('Helvetica-Bold').fontSize(8).text('Add CGST :', rightX + 6, y + taxRowH + 6);
      doc.text(Number(cgstValueTotal).toFixed(2), rightX + rightColWidth - 75, y + taxRowH + 6, { width: 70, align: 'right' });

      // Row 3: Add SGST
      doc.font('Helvetica-Bold').fontSize(8).text('Add SGST :', rightX + 6, y + taxRowH * 2 + 6);
      doc.text(Number(sgstValueTotal).toFixed(2), rightX + rightColWidth - 75, y + taxRowH * 2 + 6, { width: 70, align: 'right' });

      // Row 4: Total Amount after Tax
      doc.font('Helvetica-Bold').fontSize(8.5).text('Total Amount after Tax', rightX + 6, y + taxRowH * 3 + 6);
      doc.text(Number(finalGrandTotal).toFixed(2), rightX + rightColWidth - 75, y + taxRowH * 3 + 6, { width: 70, align: 'right' });

      y += footerBoxHeight;

      // --- 5. SINGLE SIGNATURE BLOCK ---
      const sigHeight = 70;
      doc.rect(margin, y, contentWidth, sigHeight).stroke('#000000');

      doc.font('Helvetica-Bold').fontSize(8.5).text(`FOR-${invoice.companyName || 'NANDAN ENTERPRISES (KNA03)'}`, margin + contentWidth - 250, y + 8, { width: 240, align: 'right' });

      // Render custom uploaded digital signature image if provided
      if (invoice.signatureUrl && invoice.signatureUrl.startsWith('data:image/')) {
        try {
          const sigBase64 = invoice.signatureUrl.replace(/^data:image\/\w+;base64,/, '');
          const sigBuffer = Buffer.from(sigBase64, 'base64');
          doc.image(sigBuffer, margin + contentWidth - 180, y + 20, { fit: [160, 30], align: 'right' });
        } catch (e) {
          // ignore invalid image format
        }
      }

      doc.font('Helvetica-Bold').fontSize(8.5).text('Signature.', margin + contentWidth - 110, y + 52, { width: 100, align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
