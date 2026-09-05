const express = require('express');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/send', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), (req, res) => {
  const { to, subject, body } = req.body;
  res.json({ message: `Email sent to ${to}`, subject });
});

router.post('/quotation', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'sales_rep'), (req, res) => {
  const { quotationId, recipientEmail } = req.body;
  res.json({ message: `Quotation PDF emailed to ${recipientEmail}`, quotationId });
});
router.post('/send-quotation', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'sales_rep'), (req, res) => {
  const { quotationId, recipientEmail } = req.body;
  res.json({ message: `Quotation PDF emailed to ${recipientEmail}`, quotationId });
});

router.post('/invoice', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  const { invoiceId, recipientEmail } = req.body;
  res.json({ message: `Invoice PDF emailed to ${recipientEmail}`, invoiceId });
});
router.post('/send-invoice', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  const { invoiceId, recipientEmail } = req.body;
  res.json({ message: `Invoice PDF emailed to ${recipientEmail}`, invoiceId });
});

router.post('/approval', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'sales_rep'), (req, res) => {
  const { approvalId, managerEmail } = req.body;
  res.json({ message: `Approval notification dispatched to ${managerEmail}`, approvalId });
});
router.post('/send-approval-request', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'sales_rep'), (req, res) => {
  const { approvalId, managerEmail } = req.body;
  res.json({ message: `Approval notification dispatched to ${managerEmail}`, approvalId });
});

router.post('/notification', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), (req, res) => {
  res.json({ message: 'Transactional notification email dispatched.' });
});

module.exports = router;
