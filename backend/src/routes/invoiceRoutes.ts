import { Router, Request, Response } from 'express';
import Invoice from '../models/Invoice';
import { generateInvoicePDF } from '../services/pdfService';

const router = Router();

// Get all invoices
router.get('/', async (req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single invoice
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new invoice
router.post('/', async (req: Request, res: Response) => {
  try {
    const newInvoice = new Invoice(req.body);
    const saved = await newInvoice.save();
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update invoice
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updateData = {
      ...req.body,
      logoUrl: req.body.logoUrl !== undefined ? req.body.logoUrl : '',
      signatureUrl: req.body.signatureUrl !== undefined ? req.body.signatureUrl : ''
    };
    const updated = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Invoice not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete invoice
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Stream PDF for saved invoice
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const pdfBuffer = await generateInvoicePDF(invoice.toObject());

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Bill_${(invoice.invoiceNo || invoice._id).toString().replace(/\//g, '_')}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generate PDF directly from payload (preview mode)
router.post('/generate-pdf', async (req: Request, res: Response) => {
  try {
    const pdfBuffer = await generateInvoicePDF(req.body);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Invoice_Preview.pdf"');
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
