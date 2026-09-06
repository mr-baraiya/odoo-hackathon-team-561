function emailVerifyOtp(otp) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code - DealFlow360</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
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

          <!-- Content -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; text-align: center;">
              <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
                Email Verification Code
              </h1>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                Please use the One-Time Password (OTP) below to verify your email address:
              </p>

              <!-- OTP Code Display -->
              <div style="background-color: #f1f5f9; border: 1px border #cbd5e1; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <span style="font-size: 32px; font-family: monospace; font-weight: 800; letter-spacing: 0.2em; color: #4f46e5;">
                  ${otp}
                </span>
              </div>

              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 12px 16px; text-align: left;">
                    <p style="color: #b45309; font-size: 12px; margin: 0; line-height: 1.4;">
                      <strong>Security Note:</strong> Do not share this code with anyone. This OTP will expire in 10 minutes.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; background-color: #f8fafc; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0;">
                &copy; ${new Date().getFullYear()} DealFlow360 Inc. All rights reserved.
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

module.exports = emailVerifyOtp;
