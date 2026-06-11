const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  part: { type: String, default: '' },
  qty: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  transactionId: { type: String, default: '' },
  authCode: { type: String, default: '' },

  // Customer
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },

  // Shipping
  address: { type: String, default: '' },
  address2: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zip: { type: String, default: '' },
  notes: { type: String, default: '' },

  // Line items & totals
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0.08 },   // 8%
  taxAmount: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true },

  status: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'paid' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
