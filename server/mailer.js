const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (!transporter) {
    const port = Number(SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

// Sends a "new contact message" notification email. Never throws —
// returns { sent: false } when email isn't configured or fails, so a
// broken mail setup can never lose or block a contact message.
async function sendContactNotification({ name, email, message }) {
  try {
    const t = getTransporter();
    const to = (process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL || '').trim();
    if (!t || !to) {
      console.log('Contact notification skipped: SMTP/NOTIFY_EMAIL not configured');
      return { sent: false, reason: 'not-configured' };
    }
    const from = process.env.SMTP_USER;
    await t.sendMail({
      from: `Blog contact form <${from}>`,
      to,
      replyTo: email,
      subject: `New blog message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
    return { sent: true };
  } catch (err) {
    console.error('Contact notification email failed:', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendContactNotification };
