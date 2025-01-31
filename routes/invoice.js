import express from 'express';
import { generateInvoice } from '../services/invoiceGenerator.js';

const router = express.Router();

// GET route to render the invoice page
router.get('/', (req, res) => {
    res.render('invoice', { successMessage: null });
});

// POST route to generate and download an invoice
router.post('/generate', async (req, res) => {
    const { name, email, amount, description } = req.body;

    try {
        const invoicePath = await generateInvoice({ name, email, amount, description });
        res.download(invoicePath, 'invoice.pdf');
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Error generating invoice.');
    }
});

export default router;
