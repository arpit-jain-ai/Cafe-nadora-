// ============================================================
// config/email.config.js — Nodemailer Setup
// ============================================================
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 * Send email
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to:      options.to,
    subject: options.subject,
    html:    options.html,
    text:    options.text
  };
  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

// Email Templates
const emailTemplates = {
  reservationConfirmed: (data) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0E0E0E;color:#FFF8E7;padding:2rem;border:1px solid #D4AF37">
      <h1 style="color:#D4AF37;font-family:Georgia,serif">☕ Café Nadora</h1>
      <h2>Reservation Confirmed!</h2>
      <p>Dear <strong>${data.name}</strong>,</p>
      <p>Your table reservation has been confirmed. Here are your details:</p>
      <table style="width:100%;border-collapse:collapse;margin:1rem 0">
        <tr><td style="padding:0.5rem;color:#B8A890">Date</td><td style="padding:0.5rem;color:#D4AF37">${data.date}</td></tr>
        <tr><td style="padding:0.5rem;color:#B8A890">Time</td><td style="padding:0.5rem;color:#D4AF37">${data.time}</td></tr>
        <tr><td style="padding:0.5rem;color:#B8A890">Guests</td><td style="padding:0.5rem;color:#D4AF37">${data.guests}</td></tr>
        <tr><td style="padding:0.5rem;color:#B8A890">Occasion</td><td style="padding:0.5rem;color:#D4AF37">${data.occasion || 'N/A'}</td></tr>
      </table>
      <p style="color:#B8A890">📍 Plot 131, Sahayog Vihar, Gulmohar Colony, Bhopal</p>
      <p style="color:#B8A890">📞 +91 90010 07094</p>
      <p style="color:#7A6A56;font-size:0.8rem">© 2025 Café Nadora · Developed by Arpit Jain</p>
    </div>`,

  orderReceived: (data) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0E0E0E;color:#FFF8E7;padding:2rem;border:1px solid #D4AF37">
      <h1 style="color:#D4AF37;font-family:Georgia,serif">☕ Café Nadora</h1>
      <h2>Order Received! 🎉</h2>
      <p>Dear <strong>${data.customerName}</strong>,</p>
      <p>Your order <strong style="color:#D4AF37">#${data.orderId}</strong> has been received and is being prepared.</p>
      <h3 style="color:#D4AF37">Order Summary:</h3>
      ${data.items.map(item => `<p>• ${item.name} x${item.quantity} — ₹${item.price * item.quantity}</p>`).join('')}
      <p style="font-size:1.1rem;color:#D4AF37"><strong>Total: ₹${data.totalAmount}</strong></p>
      <p style="color:#7A6A56;font-size:0.8rem">© 2025 Café Nadora · Developed by Arpit Jain</p>
    </div>`,

  contactReply: (data) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0E0E0E;color:#FFF8E7;padding:2rem;border:1px solid #D4AF37">
      <h1 style="color:#D4AF37;font-family:Georgia,serif">☕ Café Nadora</h1>
      <h2>Thank You for Reaching Out!</h2>
      <p>Dear <strong>${data.name}</strong>,</p>
      <p>We've received your message and will get back to you within 24 hours.</p>
      <p style="color:#B8A890;font-style:italic">"${data.message}"</p>
      <p style="color:#7A6A56;font-size:0.8rem">© 2025 Café Nadora · Developed by Arpit Jain</p>
    </div>`
};

module.exports = { sendEmail, emailTemplates };