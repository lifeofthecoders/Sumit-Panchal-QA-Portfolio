import nodemailer from "nodemailer";

/**
 * Create reusable transporter
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Base mail sender
 */
const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Admin Panel" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Email sending failed");
  }
};

/**
 * 🔐 Password Change Notification
 */
export const sendPasswordChangeMail = async () => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2>Password Changed Successfully</h2>
      <p>Your admin panel password has been updated.</p>
      <p>If you did not perform this action, please contact support immediately.</p>
      <hr/>
      <small>This is an automated security notification.</small>
    </div>
  `;

  await sendMail({
    to: "sumitpanchal5225@gmail.com",
    subject: "Admin Password Changed",
    html,
  });
};

/**
 * 📧 Email Change Verification
 */
export const sendEmailVerificationMail = async (verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-admin-email/${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2>Email Verification Required</h2>
      <p>You requested to change the admin email.</p>
      <p>Please click the button below to verify:</p>
      <a href="${verificationUrl}" 
         style="display:inline-block;padding:10px 20px;background:#b08bf8;color:#fff;text-decoration:none;border-radius:5px;">
         Verify Email
      </a>
      <p>This link will expire in 1 hour.</p>
      <hr/>
      <small>If you did not request this change, ignore this email.</small>
    </div>
  `;

  await sendMail({
    to: "sumitpanchal5225@gmail.com",
    subject: "Verify Admin Email Change",
    html,
  });
};