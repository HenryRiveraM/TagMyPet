import nodemailer from 'nodemailer';

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transporter() {
  if (!isEmailConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function sendEmail({ to, subject, html, text }) {
  const tx = transporter();
  if (!tx) {
    console.log(`[email disabled] ${subject} -> ${to}`);
    return { skipped: true };
  }

  return tx.sendMail({
    from: process.env.EMAIL_FROM || 'TagMyPet <no-reply@tagmypet.com>',
    to,
    subject,
    html,
    text
  });
}

export function emailConfigured() {
  return isEmailConfigured();
}
