function emailVerifyOtp(otp) {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
</head>
<body>
  <table cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 16px; width: 100%;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="font-size: 1.875rem; font-weight: bold; padding-bottom: 24px; color: #1f2937;">
                    7RD
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align: center;">
                <tr>
                  <td style="font-size: 1.25rem; font-weight: 600; color: #1f2937; padding-bottom: 16px;">
                    Email Verification Code
                  </td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding-bottom: 24px; font-size: 0.875rem;">
                    To verify your email address, please use the following One Time Password (OTP):
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 2.5rem; font-family: monospace; font-weight: bold; color: #1f2937; padding: 24px 0;">
                    ${otp}
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-top: 16px;">
                    <p style="color: #92400e; font-size: 0.875rem; margin: 0;">
                      Please do not share this code with anyone. This code will expire in 10 minutes.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px; font-size: 0.875rem; color: #6b7280; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0;">
                      If you didn't request this code, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
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
