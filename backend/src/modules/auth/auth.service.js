
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const env = require('../../config/env');
const logger = require('../../config/logger');
const ApiError = require('../../utils/apiError');
const { sendMail } = require('../../utils/mailers');
const adminsRepo = require('../administrators/administrators.repository');

const BCRYPT_COST = 10;
const RESET_TOKEN_TTL = '15m';

function signToken(admin) {
  return jwt.sign(
    { id: admin.id, role: admin.role },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}


function fingerprint(passwordHash) {
  return crypto.createHash('sha256').update(passwordHash).digest('hex').slice(0, 16);
}

function sanitize(admin) {
  return {
    id: admin.id,
    name: admin.full_name,
    email: admin.email,
    role: admin.role,
  };
}

async function login(email, password) {
  const admin = await adminsRepo.findByEmail(email);
  if (!admin) throw ApiError.unauthorized('No account found with this email');
  if (!admin.is_active) throw ApiError.forbidden('Account is disabled');

  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) throw ApiError.unauthorized('Incorrect password');

  return { token: signToken(admin), admin: sanitize(admin) };
}

async function changePassword(adminId, currentPassword, newPassword) {
  const admin = await adminsRepo.findById(adminId);
  if (!admin) throw ApiError.unauthorized('Account not found');
  if (!admin.is_active) throw ApiError.forbidden('Account is disabled');

  const ok = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!ok) throw ApiError.badRequest('Current password is incorrect');
  if (currentPassword === newPassword) {
    throw ApiError.badRequest('New password must be different from the current one');
  }

  const hash = await bcrypt.hash(newPassword, BCRYPT_COST);
  await adminsRepo.updatePassword(adminId, hash);
}

async function forgetPassword(email) {
  const admin = await adminsRepo.findByEmail(email);

  // Always respond OK — no email enumeration.
  if (!admin || !admin.is_active) return;

  const token = jwt.sign(
    { id: admin.id, fp: fingerprint(admin.password_hash) },
    env.jwt.resetSecret,
    { expiresIn: RESET_TOKEN_TTL }
  );

  const link = `${env.frontendUrl}/auth/reset-password?token=${token}`;

  try {
    await sendMail({
      to: admin.email,
      subject: 'Password reset',
      text: `Reset your password (valid 15 minutes):\n${link}\n\nIf you didn't request this, ignore this email.`,
      html: `<p>Reset your password (valid 15 minutes):</p>
             <p><a href="${link}">Reset password</a></p>
             <p>If you didn't request this, ignore this email.</p>`,
    });
  } catch (err) {
    logger.error(`forgetPassword mail failed: ${err.message}`);
  }
}

async function resetPassword(token, newPassword) {
  let payload;
  try {
    payload = jwt.verify(token, env.jwt.resetSecret);
  } catch {
    throw ApiError.badRequest('Invalid or expired token');
  }

  const admin = await adminsRepo.findById(payload.id);
  if (!admin || !admin.is_active) throw ApiError.badRequest('Invalid token');

  // Token invalid if password changed since the reset was requested.
  if (payload.fp !== fingerprint(admin.password_hash)) {
    throw ApiError.badRequest('Token already used or password changed');
  }

  const hash = await bcrypt.hash(newPassword, BCRYPT_COST);
  await adminsRepo.updatePassword(admin.id, hash);
}

module.exports = { login, changePassword, forgetPassword, resetPassword };