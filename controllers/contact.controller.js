// ============================================================
// controllers/contact.controller.js
// ============================================================
const Contact = require('../models/contact.model');
const { sendEmail, emailTemplates } = require('../config/email.config');

exports.submitContact = async (req, res, next) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    const contact = await Contact.create({ name, phone, email, subject, message });

    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: 'We received your message — Café Singhai',
          html: emailTemplates.contactReply({ name, message })
        });
      } catch (e) { console.error('Contact email error:', e.message); }
    }

    // Notify admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `[Contact] New message from ${name}`,
        html: `<p><b>Name:</b> ${name}<br><b>Phone:</b> ${phone}<br><b>Email:</b> ${email}<br><b>Subject:</b> ${subject}<br><b>Message:</b> ${message}</p>`
      });
    } catch (e) { console.error('Admin notify failed:', e.message); }

    res.status(201).json({ success: true, message: "Message received! We'll reply within 24 hours.", data: contact });
  } catch (error) { next(error); }
};

exports.getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (error) { next(error); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const update = { status: req.body.status };
    if (req.body.reply) { update.reply = req.body.reply; update.repliedAt = new Date(); }
    const contact = await Contact.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.status(200).json({ success: true, message: 'Contact updated', data: contact });
  } catch (error) { next(error); }
};
