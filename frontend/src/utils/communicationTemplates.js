/**
 * Communication Templates for Email & WhatsApp Magic Link Sharing
 */

export const generateEmailMagicLinkTemplate = ({ companyName, contactName, contactEmail, magicUrl }) => {
  const subject = `🔐 Secure Portal Access & Quotation Proposal — ${companyName || 'DealFlow360'}`;
  const body = `Dear ${contactName || 'Valued Client'},

We are pleased to invite you to review your updated quotation proposals, order status, and commercial terms on the DealFlow360 Enterprise Customer Portal.

✨ Your One-Click Magic Access Link (No Password Required):
${magicUrl}

Through your secure portal, you can:
 • Review & approve active quotation proposals
 • Track live order progress & fulfillment status
 • Access and download official PDF invoices

Note: This magic login link is securely assigned to ${contactEmail || 'your account'} and remains active for 24 hours.

If you have any questions or require adjustments, feel free to reply directly to this email.

Best regards,
Enterprise Sales Operations Team
DealFlow360 Platform`;

  return { subject, body };
};

export const generateWhatsAppMagicLinkTemplate = ({ companyName, contactName, magicUrl }) => {
  const message = `👋 Hello ${contactName || 'Customer'} (${companyName || 'DealFlow360'}),

Your quotation & order proposal on *DealFlow360* is ready for review! 📄

🔑 *One-Click Magic Login Link*:
${magicUrl}

Click the link above to view your proposal, review terms, or request adjustments directly from your mobile device.

Need assistance? Reply to this message anytime!`;

  return { message };
};
