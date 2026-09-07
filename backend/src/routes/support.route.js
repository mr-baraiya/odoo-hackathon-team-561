const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');
const vars = require('../config/var');

/**
 * POST /api/support/ticket
 * Submit support ticket & send email to EMAIL_ID (vvbaraiya32@gmail.com)
 */
router.post('/ticket', async (req, res) => {
  try {
    const { name, email, category, priority, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Full Name, Work Email, Subject, and Detailed Message are required.' });
    }

    const ticketId = `TICKET-${Math.floor(100000 + Math.random() * 900000)}`;
    const destinationEmail = vars.email.id || 'vvbaraiya32@gmail.com';

    // 1. Email notification to Admin / Support Team (EMAIL_ID)
    const emailSubject = `[Support Ticket ${ticketId}] ${subject}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; background-color: #ffffff;">
        <div style="border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 20px;">
            📩 New Support Ticket Received
          </h2>
          <span style="font-size: 12px; color: #64748b;">DealFlow360 Enterprise B2B Platform Support</span>
        </div>
        
        <p style="font-size: 14px; color: #475569; margin-bottom: 20px;">
          A new support ticket has been submitted from the platform support center.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%; color: #475569;">Ticket ID</td>
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #4f46e5;">${ticketId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Full Name</td>
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${name}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Work Email</td>
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Issue Category</td>
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #334155;">${category || 'General Inquiry'}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Priority Level</td>
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ${priority === 'Urgent' || priority === 'High' ? '#dc2626' : '#059669'};">
              ${priority || 'Medium'}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Subject</td>
            <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${subject}</td>
          </tr>
        </table>

        <div style="background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 16px;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #334155; text-transform: uppercase; tracking: 0.5px;">Detailed Message:</h4>
          <p style="white-space: pre-wrap; font-size: 13px; color: #1e293b; margin: 0; line-height: 1.5;">${message}</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
          DealFlow360 Enterprise B2B Sales Operations Platform &bull; Automated Ticket Notification
        </p>
      </div>
    `;

    // Dispatch email to EMAIL_ID
    const mailResult = await sendEmail({
      to: destinationEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    // 2. Dispatch receipt acknowledgment email to submitter
    try {
      await sendEmail({
        to: email,
        subject: `[DealFlow360 Support] Ticket Received: ${ticketId}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #4f46e5; margin-top: 0;">We Received Your Support Ticket</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for reaching out to DealFlow360 Support. Your ticket has been created and assigned reference ID <strong style="color: #4f46e5; font-family: monospace;">${ticketId}</strong>.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0 0 4px 0; font-size: 13px;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 0; font-size: 13px;"><strong>Category:</strong> ${category || 'General Inquiry'}</p>
            </div>

            <p style="font-size: 13px; color: #475569;">Our technical operations team typically responds within 2 hours.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b; margin: 0;">DealFlow360 Support Operations Team</p>
          </div>
        `
      });
    } catch (ackError) {
      console.warn('[Support Ticket Ack Warning]:', ackError.message);
    }

    return res.json({
      success: true,
      ticketId,
      message: `Support ticket ${ticketId} created and dispatched to ${destinationEmail}`,
      mailResult,
    });
  } catch (err) {
    console.error('[Support Ticket Endpoint Error]:', err);
    return res.status(500).json({ error: 'Failed to process support ticket. Please try again.' });
  }
});

module.exports = router;
