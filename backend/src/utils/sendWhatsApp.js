const axios = require('axios');
const qs = require('qs');
const vars = require('../config/var');

/**
 * Send WhatsApp notification via Twilio REST API (with URL Call-to-Action button support & console fallback)
 * @param {Object} options - { to, message, buttonText, buttonUrl, contentSid, contentVariables }
 */
async function sendWhatsApp({ to, message, buttonText, buttonUrl, contentSid, contentVariables }) {
  let targetPhone = String(to || '').trim().replace(/\s+/g, '');
  if (!targetPhone.startsWith('+')) {
    if (targetPhone.length === 10) {
      targetPhone = `+91${targetPhone}`;
    } else {
      targetPhone = `+${targetPhone}`;
    }
  }

  const accountSid = vars.whatsapp.accountSid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = vars.whatsapp.authToken || process.env.TWILIO_AUTH_TOKEN;
  let fromNumber = vars.whatsapp.number || process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  
  if (!fromNumber.startsWith('whatsapp:')) {
    fromNumber = `whatsapp:${fromNumber}`;
  }

  const recipientWhatsapp = targetPhone.startsWith('whatsapp:') ? targetPhone : `whatsapp:${targetPhone}`;

  console.log(`[WHATSAPP SERVICE] Attempting dispatch to "${recipientWhatsapp}" from "${fromNumber}"`);

  if (accountSid && authToken && !accountSid.includes('AC_') && !authToken.includes('your_')) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const payload = {
        From: fromNumber,
        To: recipientWhatsapp,
        Body: message,
      };

      if (contentSid) {
        payload.ContentSid = contentSid;
        if (contentVariables) {
          payload.ContentVariables = typeof contentVariables === 'object' ? JSON.stringify(contentVariables) : contentVariables;
        }
      }

      const data = qs.stringify(payload);
      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authHeader,
        },
      });

      console.log(`[WHATSAPP TWILIO SUCCESS] Message SID: ${response.data.sid} dispatched to ${recipientWhatsapp}`);
      return {
        success: true,
        sid: response.data.sid,
        status: response.data.status,
        provider: 'twilio',
        ctaButton: buttonUrl ? { text: buttonText || 'Open Portal', url: buttonUrl } : null,
      };
    } catch (err) {
      console.warn(`[WHATSAPP TWILIO WARNING] Twilio dispatch error: ${err.response?.data?.message || err.message}`);
    }
  }

  // Fallback / Simulated Log with WhatsApp CTA Button representation
  console.log(`========================= SIMULATED WHATSAPP DISPATCH =========================`);
  console.log(`To: ${recipientWhatsapp}`);
  console.log(`Body:\n${message}`);
  if (buttonUrl) {
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`[ 🔗 WHATSAPP CALL-TO-ACTION BUTTON ]`);
    console.log(`Label : ${buttonText || 'Open Link'}`);
    console.log(`URL   : ${buttonUrl}`);
  }
  console.log(`================================================================================`);

  return {
    success: true,
    simulated: true,
    to: recipientWhatsapp,
    ctaButton: buttonUrl ? { text: buttonText || 'Open Portal', url: buttonUrl } : null,
    timestamp: new Date().toISOString(),
  };
}

module.exports = sendWhatsApp;
