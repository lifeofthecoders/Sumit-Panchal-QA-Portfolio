import nodemailer from "nodemailer";

// ────────────────────────────────────────────────
// Reusable transporter (Gmail with App Password)
// ────────────────────────────────────────────────
// Important notes (2025–2026):
//   1. You MUST use a Google App Password (NOT your regular password)
//      → Enable 2-Step Verification → https://myaccount.google.com/apppasswords
//   2. Store EMAIL_USER and EMAIL_APP_PASSWORD in .env (never commit!)
//   3. For production or high volume → consider switching to transactional email
//      services: Resend, Brevo, Mailgun, Postmark, Amazon SES, etc.
//   4. OAuth2 is more secure but more complex to set up → see nodemailer docs if needed

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,          // e.g. yourname@gmail.com
    pass: process.env.EMAIL_APP_PASSWORD,  // 16-character App Password
  },
  // Optional: increase timeout if you face connection issues
  // connectionTimeout: 5000,
  // greetingTimeout: 5000,
  // socketTimeout: 5000,
});

/**
 * Generic email sender
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - email subject
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - plain text fallback (recommended)
 */
const sendMail = async ({ to, subject, html, text = "" }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Admin Panel" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ""), // simple fallback if no text provided
    });

    console.log(`Email sent successfully → Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Failed to send email:", {
      to,
      subject,
      error: error.message,
      stack: error.stack?.substring(0, 300),
    });
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

/**
 * Send password change notification to the admin
 * @param {string} adminEmail - The admin's actual email address
 */
export const sendPasswordChangeMail = async (adminEmail) => {
  if (!adminEmail || !adminEmail.includes("@")) {
    throw new Error("Valid admin email is required for password change notification");
  }

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #b08bf8; margin-bottom: 16px;">Password Changed Successfully</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        Your admin panel password was recently updated.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        <strong>If you did NOT change your password,</strong> please 
        <a href="mailto:support@yourdomain.com" style="color: #b08bf8;">contact support immediately</a>.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 13px; color: #777; text-align: center;">
        This is an automated security notification from your Admin Panel.<br>
        © ${new Date().getFullYear()} Sumit Panchal QA Portfolio
      </p>
    </div>
  `;

  return sendMail({
    to: adminEmail,
    subject: "🔐 Admin Password Changed",
    html,
    text: `Your admin password was changed.\nIf this wasn't you, contact support immediately.`,
  });
};

/**
 * Send email change verification link
 * @param {string} adminEmail - Current/new admin email
 * @param {string} verificationToken - Token for verification
 */
export const sendEmailVerificationMail = async (adminEmail, verificationToken) => {
  if (!adminEmail || !verificationToken) {
    throw new Error("Admin email and verification token are required");
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationUrl = `${frontendUrl}/verify-admin-email/${verificationToken}`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #b08bf8; margin-bottom: 16px;">Verify Your New Email Address</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        You requested to update the admin email address.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        Click the button below to verify:
      </p>
      <a href="${verificationUrl}"
         style="display: inline-block; margin: 20px 0; padding: 12px 32px; background: #b08bf8; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Verify Email Address
      </a>
      <p style="font-size: 15px; color: #555;">
        This link will expire in 1 hour.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 13px; color: #777; text-align: center;">
        If you did not request this change, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendMail({
    to: adminEmail,
    subject: "Verify Admin Email Change",
    html,
    text: `Verify your new email: ${verificationUrl}\nThis link expires in 1 hour.`,
  });
};

// Optional: export the transporter if you need to use it elsewhere (e.g. test connection)
export { transporter };