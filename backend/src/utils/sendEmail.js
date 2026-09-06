const nodemailer = require('nodemailer');
const vars = require('../config/var');

let primaryTransporter = null;
let etherealTransporter = null;

function getPrimaryTransporter() {
  if (!primaryTransporter) {
    primaryTransporter = nodemailer.createTransport({
      host: vars.email.smtpHost || 'smtp.gmail.com',
      port: parseInt(vars.email.smtpPort || '587', 10),
      secure: false,
      auth: {
        user: vars.email.id,
        pass: vars.email.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return primaryTransporter;
}

async function getEtherealTransporter() {
  if (!etherealTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email Service] Ethereal test account created: ${testAccount.user}`);
    } catch (err) {
      console.error('[Email Service] Failed to create Ethereal test account:', err.message);
    }
  }
  return etherealTransporter;
}

/**
 * Send Email utility function
 * @param {Object} options - { to, subject, html, text }
 */
async function sendEmail({ to, subject, html, text }) {
  const mailOptions = {
    from: `"DealFlow360 Support" <${vars.email.id || 'support@dealflow360.com'}>`,
    to,
    subject,
    text: text || html.replace(/<[^>]*>?/gm, ''),
    html,
  };

  // 1. Try Primary Configured Transporter
  try {
    const mailer = getPrimaryTransporter();
    const info = await mailer.sendMail(mailOptions);
    console.log(`[Email Service SUCCESS] Message sent to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, provider: 'smtp' };
  } catch (primaryError) {
    console.warn(`[Email Service Warning] Primary SMTP (${vars.email.smtpHost}) failed: ${primaryError.message}. Attempting Ethereal test mail fallback.`);

    // 2. Try Ethereal Test Mailer
    try {
      const ethereal = await getEtherealTransporter();
      if (ethereal) {
        const info = await ethereal.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[Email Service ETHEREAL SUCCESS] Sent to ${to}`);
        console.log(`[Email Service ETHEREAL Preview URL]: ${previewUrl}`);
        return { success: true, messageId: info.messageId, previewUrl, provider: 'ethereal' };
      }
    } catch (etherealError) {
      console.error(`[Email Service Error] Ethereal fallback failed: ${etherealError.message}`);
    }

    // 3. Simulated Log Fallback
    console.log(`========================= SIMULATED EMAIL DISPATCH =========================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`===========================================================================`);
    return { success: true, simulated: true, error: primaryError.message };
  }
}

module.exports = sendEmail;
