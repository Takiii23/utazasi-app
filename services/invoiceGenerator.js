import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoice = async ({ name, email, amount, description }) => {
    const doc = new PDFDocument();
    const invoicePath = path.join('invoices', `invoice-${Date.now()}.pdf`);

    doc.pipe(fs.createWriteStream(invoicePath));

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.text(`Name: ${name}`, 50, 100);
    doc.text(`Email: ${email}`, 50, 130);
    doc.text(`Amount: ${amount} HUF`, 50, 160);
    doc.text(`Description: ${description}`, 50, 190);

    doc.end();

    return new Promise((resolve, reject) => {
        doc.on('finish', () => resolve(invoicePath));
        doc.on('error', (err) => reject(err));
    });
};
