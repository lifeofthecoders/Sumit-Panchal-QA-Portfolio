
import nodemailer from "nodemailer";

/* ==========================================
   EMAIL TRANSPORTER
   Gmail SMTP retained for local development.
========================================== */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/* ==========================================
   COMMON HELPERS
========================================== */

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

const getFrontendUrl = () => {
  const frontendUrl =
    process.env.FRONTEND_URL ||
    "http://localhost:5173/Sumit-Panchal-QA-Portfolio";

  return frontendUrl.replace(/\/+$/, "");
};

/* ==========================================
   GENERIC EMAIL SENDER
   Production: Resend HTTPS API
   Local: Existing Gmail SMTP
========================================== */

const sendMail = async ({ to, subject, html, text = "" }) => {
  if (!to || !subject || !html) {
    throw new Error(
      "Recipient, subject and email content are required."
    );
  }

  const isProduction = process.env.NODE_ENV === "production";

  const mailBridgeUrl = process.env.MAIL_BRIDGE_URL?.trim();
  const mailBridgeSecret = process.env.MAIL_BRIDGE_SECRET?.trim();

  /*
   * PRODUCTION EMAIL DELIVERY
   * Render HTTPS → Google Apps Script → Gmail
   */

  if (isProduction || mailBridgeUrl || mailBridgeSecret) {
    if (!mailBridgeUrl || !mailBridgeSecret) {
      throw new Error(
        "Email bridge configuration is incomplete. " +
        "Configure MAIL_BRIDGE_URL and MAIL_BRIDGE_SECRET."
      );
    }

    let endpoint;

    try {
      endpoint = new URL(mailBridgeUrl);
    } catch {
      throw new Error("Invalid MAIL_BRIDGE_URL configuration.");
    }

    if (
      endpoint.protocol !== "https:" ||
      endpoint.hostname !== "script.google.com" ||
      !endpoint.pathname.startsWith("/macros/s/") ||
      !endpoint.pathname.endsWith("/exec")
    ) {
      throw new Error(
        "MAIL_BRIDGE_URL must be a valid Google Apps Script Web App URL."
      );
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 25000);

    try {
      const response = await fetch(endpoint.toString(), {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          secret: mailBridgeSecret,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ""),
        }),
        signal: controller.signal,
      });

      const responseText = await response.text();

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Google Apps Script returned an invalid response. " +
          "Check its Web App deployment and access settings."
        );
      }

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message ||
          `Email bridge request failed with HTTP ${response.status}.`
        );
      }

      console.log(
        "Email successfully sent through Google Apps Script.",
        { subject }
      );

      return {
        messageId: null,
        accepted: [to],
        rejected: [],
      };

    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(
          "Google Apps Script email request timed out."
        );
      }

      console.error(
        "Google Apps Script email delivery failed:",
        error.message
      );

      throw new Error(
        `Email sending failed: ${error.message}`
      );

    } finally {
      clearTimeout(timeoutId);
    }
  }

  /*
   * LOCAL DEVELOPMENT
   * Retain the existing Gmail SMTP implementation.
   */

  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_APP_PASSWORD
  ) {
    throw new Error(
      "Local email configuration missing. " +
      "Check EMAIL_USER and EMAIL_APP_PASSWORD."
    );
  }

  try {
    const info = await transporter.sendMail({
      from: `"Sumit Panchal | Quality Assurance" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ""),
    });

    if (!info.accepted || info.accepted.length === 0) {
      throw new Error(
        "The email provider did not accept the recipient."
      );
    }

    console.log(
      "Local Gmail email sent successfully:",
      { messageId: info.messageId }
    );

    return info;

  } catch (error) {
    console.error(
      "Local Gmail email delivery failed:",
      error.message
    );

    throw new Error(
      `Email sending failed: ${error.message}`
    );
  }
};

/* ==========================================
   PASSWORD RESET EMAIL
========================================== */

export const sendPasswordResetMail = async (
  adminEmail,
  resetToken
) => {
  if (!adminEmail || !adminEmail.includes("@")) {
    throw new Error("A valid administrator email is required.");
  }

  if (
    typeof resetToken !== "string" ||
    !/^[a-f0-9]{64}$/i.test(resetToken)
  ) {
    throw new Error("A valid password reset token is required.");
  }

  const resetUrl =
    `${getFrontendUrl()}/#/admin/reset-password?token=${encodeURIComponent(resetToken)}`;

  const safeResetUrl = escapeHtml(resetUrl);
  const safeEmail = escapeHtml(adminEmail);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Administrator Password</title>
    </head>

    <body style="
      margin: 0;
      padding: 30px 15px;
      background: #f4f5fa;
      font-family: Arial, Helvetica, sans-serif;
      color: #1f2937;
    ">

      <div style="
        max-width: 580px;
        margin: 0 auto;
        overflow: hidden;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
      ">

        <div style="
          padding: 30px 24px;
          text-align: center;
          background: linear-gradient(110deg, #e3a8fe, #f51cc2, #2d32ca);
          color: #ffffff;
        ">
          <h1 style="
            margin: 0;
            font-size: 25px;
            font-weight: 800;
            letter-spacing: 1px;
          ">
            SUMIT PANCHAL
          </h1>

          <p style="
            margin: 9px 0 0;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 2px;
          ">
            QUALITY ASSURANCE
          </p>

          <p style="
            margin: 15px 0 0;
            font-size: 12px;
            letter-spacing: 1px;
          ">
            ADMINISTRATION PORTAL
          </p>
        </div>

        <div style="padding: 35px 30px;">

          <h2 style="
            margin: 0 0 18px;
            color: #7c3aed;
            font-size: 24px;
          ">
            Reset Your Password
          </h2>

          <p style="font-size: 15px; line-height: 1.8; color: #374151;">
            Dear Administrator,
          </p>

          <p style="font-size: 15px; line-height: 1.8; color: #374151;">
            We have received a request to reset the administrator account password associated with the following email address:
          </p>

          <p style="
            padding: 14px 16px;
            background: #f5f3ff;
            border: 1px solid #ede9fe;
            border-radius: 8px;
            text-align: center;
            font-size: 15px;
            font-weight: 600;
            color: #374151;
            overflow-wrap: anywhere;
          ">
            ${safeEmail}
          </p>

          <p style="font-size: 15px; line-height: 1.8; color: #374151;">
            To proceed, please select the button below to securely create a new password for your administrator account.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a
              href="${safeResetUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display: inline-block;
                padding: 15px 36px;
                border-radius: 8px;
                background: #7c3aed;
                color: #ffffff;
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.3px;
                text-decoration: none;
              "
            >
              Reset Administrator Password
            </a>
          </div>

          <p style="
            color: #6b7280;
            font-size: 13px;
            line-height: 1.8;
          ">
            <strong>Security Notice:</strong> This password reset link is valid for 10 minutes and may only be used once. For your protection, it will expire automatically after this period.
          </p>

          <p style="
            color: #6b7280;
            font-size: 13px;
            line-height: 1.8;
          ">
            If you did not initiate this request, no further action is required. Your existing password will remain unchanged. If you have concerns about your account security, please contact the appropriate administrator.
          </p>

          <p style="
            margin: 20px 0 0;
            color: #9ca3af;
            font-size: 12px;
            line-height: 1.7;
            text-align: center;
          ">
            This is an automated notification. Please do not reply to this email, as this inbox is not monitored.
          </p>

          <hr style="
            margin: 28px 0;
            border: none;
            border-top: 1px solid #e5e7eb;
          " />

          <p style="
            margin: 0;
            color: #9ca3af;
            font-size: 12px;
            line-height: 1.8;
            text-align: center;
          ">
            Precision in Every Detail. Quality in Every Release.
            <br />
            © ${new Date().getFullYear()} Sumit Panchal | Quality Assurance Portfolio
          </p>

        </div>
      </div>

    </body>
    </html>
  `;

  const text = `
Reset Your Administrator Password

We received a request to reset the administrator password for ${adminEmail}.

Open this secure link to reset your password:

${resetUrl}

This link expires in 10 minutes and can only be used once.

If you did not request this reset, ignore this email.

Sumit Panchal | Quality Assurance
  `.trim();

  return sendMail({
    to: adminEmail,
    subject: "🔐 Reset Your Admin Panel Password",
    html,
    text,
  });
};

/* ==========================================
   PASSWORD CHANGE NOTIFICATION
========================================== */

export const sendPasswordChangeMail = async (adminEmail) => {
  if (!adminEmail || !adminEmail.includes("@")) {
    throw new Error(
      "Valid administrator email is required for password notification."
    );
  }

  const html = `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    ">

    <h2 style="
      margin: 0 0 20px;
      color: #7c3aed;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.4;
    ">
      Password Updated Successfully
    </h2>

    <p style="font-size: 15px; line-height: 1.8; color: #374151;">
      Dear Administrator,
    </p>

    <p style="font-size: 15px; line-height: 1.8; color: #374151;">
      This is to confirm that the password associated with your administrator account has been successfully updated.
    </p>

    <div style="
      margin: 22px 0;
      padding: 16px;
      background: #f5f3ff;
      border: 1px solid #ede9fe;
      border-radius: 8px;
      text-align: center;
    ">
      <p style="
        margin: 0;
        color: #7c3aed;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.3px;
      ">
        ACCOUNT SECURITY STATUS
      </p>
      <p style="
        margin: 7px 0 0;
        color: #374151;
        font-size: 15px;
        font-weight: 600;
      ">
        Password Successfully Updated
      </p>
    </div>

    <p style="font-size: 15px; line-height: 1.8; color: #374151;">
      If you did not authorize this change, please take immediate steps to secure your account and contact the appropriate administrator.
    </p>

    <p style="
      margin: 20px 0 0;
      color: #9ca3af;
      font-size: 12px;
      line-height: 1.7;
      text-align: center;
    ">
      This is an automated security notification. Please do not reply to this email, as this inbox is not monitored.
    </p>

    <hr style="
      margin: 28px 0;
      border: none;
      border-top: 1px solid #e5e7eb;
    " />

    <p style="
      margin: 0;
      color: #9ca3af;
      font-size: 12px;
      line-height: 1.8;
      text-align: center;
    ">
      Precision in Every Detail. Quality in Every Release.
      <br />
      © ${new Date().getFullYear()} Sumit Panchal | Quality Assurance Portfolio
    </p>
    </div>
  `;

  return sendMail({
    to: adminEmail,
    subject: "🔐 Admin Password Changed",
    html,
    text:
      "Your administrator password was changed. If this was not you, secure your account immediately.",
  });
};

/* ==========================================
   EMAIL CHANGE VERIFICATION
========================================== */

export const sendEmailVerificationMail = async (
  adminEmail,
  verificationToken
) => {
  if (!adminEmail || !verificationToken) {
    throw new Error(
      "Administrator email and verification token are required."
    );
  }

  const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const verificationUrl =
    `${frontendUrl.replace(/\/+$/, "")}/verify-admin-email/${encodeURIComponent(verificationToken)}`;

  const safeUrl = escapeHtml(verificationUrl);

  const html = `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    ">
      <h2 style="color: #7c3aed;">
        Verify Your New Email Address
      </h2>

      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        You requested to update your administrator email address.
      </p>

      <a
        href="${safeUrl}"
        style="
          display: inline-block;
          margin: 20px 0;
          padding: 12px 32px;
          background: #8b5cf6;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        "
      >
        Verify Email Address
      </a>

      <p style="font-size: 15px; color: #555;">
        This link will expire in 1 hour.
      </p>

      <p style="font-size: 13px; color: #777;">
        If you did not request this change, ignore this email.
      </p>
    </div>
  `;

  return sendMail({
    to: adminEmail,
    subject: "Verify Admin Email Change",
    html,
    text: `Verify your new email address: ${verificationUrl}\nThis link expires in 1 hour.`,
  });
};

/* ==========================================
   TRANSPORTER EXPORT
========================================== */

export { transporter };
