function emailVerifyOtp(url) {
  return `
   <html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP</title>

  <style>
    .flex {
      display: flex;
    }

    .justify-center {
      justify-content: center;
    }
  </style>
</head>

<body>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 16px;">
    <tr>
      <td align="center">
        <!-- Main Wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="padding: 24px;">
              <!-- Logo -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="font-size: 1.875rem; font-weight: bold; margin-bottom: 32px;">
                    <table>
                      <tr style="font-size: 1.875rem;">
                        <td style="font-weight: 200;">Simple</td>&nbsp;
                        <td style="color: #ef4444;">P</td>
                        <td style="color: #3b82f6;">G</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <br />

              <!-- Content -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align: center;">
                <tr>
                  <td style="font-size: 1.5rem; font-weight: 600; color: #1f2937; margin-bottom: 16px;">
                    Reset Your Password
                  </td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding-bottom: 16px;">
                    We received a request to reset your password. Click the button below to create a new password:
                  </td>
                </tr>

                <!-- Reset Button -->
                <tr>
                  <td style="padding: 32px 0;">
                    <a href="${url}"
                      style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 1rem; font-weight: 500; border-radius: 8px; text-decoration: none;">
                      Reset Password
                    </a>
                  </td>
                </tr>

                <!-- Security Notice -->
                <tr>
                  <td
                    style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-top: 24px;">
                    <p style="color: #92400e; font-size: 0.875rem; margin: 0;">
                      For security reasons, this password reset link will expire in 1 hour. Please do not share this
                      email with anyone.
                    </p>
                  </td>
                </tr>

                <!-- Additional Info -->
                <tr>
                  <td style="padding-top: 24px; color: #6b7280; font-size: 0.875rem; text-align: left;">
                    <p style="margin: 0; text-align: center;">
                      If you didn’t request a password reset, please ignore this email or contact support if you have
                      concerns.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #6b7280; text-align: center;">Button not working? Copy and paste
                            this link into your
                            browser:</p>
                          <p style="margin: 8px 0 0; color: #2563eb; word-wrap: break-word;text-align: center;">
                            ${url}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              style="padding: 16px; background-color: #f9fafb; font-size: 0.75rem; color: #6b7280; text-align: center;">
              <p style="margin: 0;">
                This is an automated message, please do not reply to this email.
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
