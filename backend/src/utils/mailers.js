const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  auth: { user: env.smtp.user, pass: env.smtp.pass },
});

async function sendMail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"${env.mail.fromName}" <${env.mail.fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent: ${info.messageId} → ${to}`);
    return info;
  } catch (err) {
    logger.error(`Email send failed: ${err.message}`);
    throw err;
  }
}

module.exports = { sendMail };