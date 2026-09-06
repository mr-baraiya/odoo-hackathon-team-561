function magicLinkEmail(url, recipientName = 'Valued Customer') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customer Portal Magic Login Link - DealFlow360</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <span style="font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em;">
                DealFlow<span style="color: #4f46e5;">360</span>
              </span>
              <div style="font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px;">
                Enterprise B2B Sales Operations Platform
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; text-align: center;">
              <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
                Log In to Customer Portal
              </h1>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 8px 0;">
                Hello <strong>${recipientName}</strong>,
              </p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 28px 0;">
                We received a request to log in to your DealFlow360 Customer Portal. Click the button below to instantly log in without entering a password:
              </p>

              <!-- Magic Link Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${url}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 600; border-radius: 12px; text-decoration: none; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.25);">
                      Access Customer Portal
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px 18px; text-align: left;">
                    <p style="color: #b45309; font-size: 12px; line-height: 1.5; margin: 0;">
                      <strong>Security Notice:</strong> This magic login link is valid for 24 hours and can only be used to sign in to your registered customer account. If you did not request this login, please ignore this message.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Copy Link Fallback -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: left;">
                <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; text-align: center;">
                  Button not working? Copy and paste this link into your browser:
                </p>
                <p style="font-size: 11px; font-family: monospace; color: #4f46e5; word-break: break-all; margin: 0; text-align: center; background-color: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  ${url}
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; background-color: #f8fafc; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0;">
                &copy; ${new Date().getFullYear()} DealFlow360 Inc. All rights reserved. Automated customer portal security notification.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = magicLinkEmail;
