/**
 * OTP utility functions (generation, hashing, validation).
 *
 * Important security rule: never persist raw OTP; only persist a hash.
 */
'use strict';

const crypto = require('crypto');

const getOtpConfig = () => {
  // Use a dedicated secret if available; otherwise fall back to Strapi's token salt.
  // In production you should set `OTP_HASH_SALT` explicitly.
  const salt =
    process.env.OTP_HASH_SALT || process.env.API_TOKEN_SALT || 'dev-change-me';

  if (!process.env.OTP_HASH_SALT) {
    // eslint-disable-next-line no-console
    console.warn(
      '[OTP] OTP_HASH_SALT is not set. Falling back to API_TOKEN_SALT/dev salt. Set OTP_HASH_SALT in production.'
    );
  }

  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES ?? 7);
  const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);
  const resendCooldownSeconds = Number(
    process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60
  );

  return {
    salt,
    otpLength: 6,
    expiryMinutes,
    maxAttempts,
    resendCooldownSeconds,
  };
};

const generateOtp = (length = 6) => {
  // Generates a numeric OTP like "123456"
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

const hashOtp = (otp, salt) => {
  // HMAC keeps hashing deterministic but avoids storing raw OTP.
  return crypto
    .createHmac('sha256', salt)
    .update(String(otp))
    .digest('hex');
};

const timingSafeEqualHex = (aHex, bHex) => {
  const aBuf = Buffer.from(String(aHex), 'hex');
  const bBuf = Buffer.from(String(bHex), 'hex');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

const isExpired = (expiryTime) => {
  if (!expiryTime) return true;
  return new Date(expiryTime).getTime() < Date.now();
};

module.exports = {
  getOtpConfig,
  generateOtp,
  hashOtp,
  timingSafeEqualHex,
  isExpired,
};

