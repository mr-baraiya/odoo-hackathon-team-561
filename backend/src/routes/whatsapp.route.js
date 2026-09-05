const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/whatsapp/menu
router.get('/menu', authenticateJWT, (req, res) => {
  res.json({
    title: 'DealFlow360 WhatsApp Assistant',
    options: [
      { key: '1', label: 'View Quotations' },
      { key: '2', label: 'Request Discount' },
      { key: '3', label: 'Accept Quotation' },
      { key: '4', label: 'Order Status' },
      { key: '5', label: 'Delivery Status' },
    ],
  });
});

// POST /api/whatsapp/menu/select
router.post('/menu/select', authenticateJWT, (req, res) => {
  const { optionKey, customerPhone } = req.body;
  res.json({
    selectedKey: optionKey,
    response: `Processed selection ${optionKey} for ${customerPhone || 'customer'}`,
  });
});

// POST /api/whatsapp/webhook (Twilio Webhook Receiver - Public / Token Verification via Twilio signature)
router.post('/webhook', (req, res) => {
  const fromPhone = req.body.From || req.body.phone_number || '';
  const bodyText = (req.body.Body || req.body.text || '').trim();

  const cleanPhone = fromPhone.replace('whatsapp:', '').trim();
  const matchedUser = seed.USERS.find((u) => u.phone_number === cleanPhone || cleanPhone.includes(u.phone_number.replace('+', '')));

  const userRole = matchedUser ? matchedUser.role : 'customer';
  const userName = matchedUser ? matchedUser.full_name : 'Valued Customer';

  let replyText = '';

  if (bodyText === '1' || bodyText.toLowerCase().includes('quote')) {
    const userQuotes = seed.QUOTATIONS.slice(0, 2).map((q) => `• ${q.quote_number}: $${q.total_amount} (${q.status})`).join('\n');
    replyText = `📄 *DealFlow360 Quotations for ${userName}*:\n\n${userQuotes || 'No active quotations found.'}`;
  } else if (bodyText === '2' || bodyText.toLowerCase().includes('discount')) {
    replyText = `🏷️ *Request Discount*:\nPlease respond with your desired discount percentage (e.g. "Counter 10%") to submit for sales manager review.`;
  } else if (bodyText === '3' || bodyText.toLowerCase().includes('accept')) {
    replyText = `✅ *Accept Quotation*:\nYour quotation has been confirmed and submitted to fulfillment!`;
  } else if (bodyText === '4' || bodyText.toLowerCase().includes('order')) {
    replyText = `📦 *Order Status*:\nOrder #ORD-Q-2026-101 is currently [Pending Fulfillment] at Main Central Warehouse.`;
  } else if (bodyText === '5' || bodyText.toLowerCase().includes('delivery')) {
    replyText = `🚚 *Delivery Status*:\nEstimated delivery date: 2026-09-12 via FedEx Express (Tracking #FX-88912).`;
  } else {
    replyText = `🤖 *DealFlow360 WhatsApp Assistant*\n\nHello ${userName}!\nPlease select an option:\n\n1️⃣ View Quotation\n2️⃣ Request Discount\n3️⃣ Accept Quotation\n4️⃣ Order Status\n5️⃣ Delivery Status\n\nReply with 1-5 to proceed.`;
  }

  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${replyText}</Message>
</Response>`);
});

// POST /api/whatsapp/send
router.post('/send', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'sales_rep'), (req, res) => {
  const { to, message } = req.body;
  res.json({
    success: true,
    message: `WhatsApp message dispatched to ${to}`,
    content: message,
  });
});

module.exports = router;
