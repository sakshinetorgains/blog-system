'use strict';

const {
  getOtpConfig,
  generateOtp,
  hashOtp,
  timingSafeEqualHex,
  isExpired,
} = require('./otp-utils');

const subscriberManager = require('../../subscribe/services/subscriber-manager');

const OTP_UID = 'api::otp.otp';

const otpError = (status, message, meta = {}) => ({
  status,
  message,
  meta,
});

// const requestOtp = async (strapi, subscriptionData) => {
//   const { salt, expiryMinutes, maxAttempts, resendCooldownSeconds } =
//     getOtpConfig();

//   const { email } = subscriptionData;

//   const subscriber = await subscriberManager.findByEmail(strapi, email);
//   if (subscriber?.verified) {
//     return otpError(400, 'You have already subscribed');
//   }

//   // Cooldown: prevent repeated OTP spam within a short window
//   const existingOtps = await strapi.entityService.findMany(OTP_UID, {
//     filters: { email, verified: false },
//     sort: { createdAt: 'desc' },
//     limit: 1,
//   });

//   if (existingOtps.length > 0) {
//     const latest = existingOtps[0];
//     // If the OTP is already expired, allow a resend immediately.
//     if (!isExpired(latest.expiry_time)) {
//       const createdAtMs = new Date(latest.createdAt).getTime();
//       const nowMs = Date.now();

//       const deltaSeconds = Math.floor((nowMs - createdAtMs) / 1000);
//       if (deltaSeconds < resendCooldownSeconds) {
//         const retryAfterSeconds = resendCooldownSeconds - deltaSeconds;
//         return otpError(429, 'Please wait before requesting a new OTP', {
//           retryAfterSeconds,
//         });
//       }
//     }
//   }

//   // Keep at most 1 active OTP per email
//   await strapi.db.query(OTP_UID).deleteMany({
//     where: { email, verified: false },
//   });

//   const otp = generateOtp();
//   const hashed = hashOtp(otp, salt);
//   const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

//   await subscriberManager.upsertPending(strapi, subscriptionData);

//   await strapi.entityService.create(OTP_UID, {
//     data: {
//       email,
//       hashed_otp: hashed,
//       expiry_time: expiresAt,
//       attempt_count: 0,
//       verified: false,
//     },
//   });

//   // Console log is fine for dev; raw OTP must not be persisted.
//   console.log(`[OTP] OTP for ${email}: ${otp}`);

//   return {
//     message: 'OTP sent successfully',
//     otpExpiresInSeconds: expiryMinutes * 60,
//     resendCooldownSeconds,
//     maxAttempts,
//   };
// };

const requestOtp = async (strapi, subscriptionData) => {
  const { salt, expiryMinutes, maxAttempts, resendCooldownSeconds } =
    getOtpConfig();

  const { email } = subscriptionData;

  const subscriber = await subscriberManager.findByEmail(strapi, email);
  if (subscriber?.verified) {
    return otpError(400, 'You have already subscribed');
  }

  // Cooldown check
  const existingOtps = await strapi.entityService.findMany(OTP_UID, {
    filters: { email, verified: false },
    sort: { createdAt: 'desc' },
    limit: 1,
  });

  if (existingOtps.length > 0) {
    const latest = existingOtps[0];

    if (!isExpired(latest.expiry_time)) {
      const createdAtMs = new Date(latest.createdAt).getTime();
      const nowMs = Date.now();

      const deltaSeconds = Math.floor((nowMs - createdAtMs) / 1000);

      if (deltaSeconds < resendCooldownSeconds) {
        return otpError(429, 'Please wait before requesting a new OTP', {
          retryAfterSeconds: resendCooldownSeconds - deltaSeconds,
        });
      }
    }
  }

  // Delete old OTPs
  await strapi.db.query(OTP_UID).deleteMany({
    where: { email, verified: false },
  });

  // 🔢 Generate OTP
  const otp = generateOtp();
  const hashed = hashOtp(otp, salt);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await subscriberManager.upsertPending(strapi, subscriptionData);

  // 💾 Save OTP
  await strapi.entityService.create(OTP_UID, {
    data: {
      email,
      hashed_otp: hashed,
      expiry_time: expiresAt,
      attempt_count: 0,
      verified: false,
    },
  });

  // ✉️ SEND EMAIL (THIS WAS MISSING)
  try {
    console.log("📩 Sending OTP to:", email);

    await strapi.plugins['email'].services.email.send({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Your OTP Code',
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for ${expiryMinutes} minutes.</p>
      `,
    });

    console.log("✅ OTP email sent successfully");

  } catch (err) {
    console.error("❌ Email sending failed:", err);

    return otpError(500, 'Failed to send OTP email');
  }

  return {
    message: 'OTP sent successfully',
    otpExpiresInSeconds: expiryMinutes * 60,
    resendCooldownSeconds,
    maxAttempts,
  };
};
const verifyOtp = async (strapi, { email, otp, subscriberData }) => {
  const { salt, maxAttempts } = getOtpConfig();

  const latestOtps = await strapi.entityService.findMany(OTP_UID, {
    filters: { email, verified: false },
    sort: { createdAt: 'desc' },
    limit: 1,
  });

  if (!latestOtps.length) {
    return otpError(400, 'OTP not found');
  }

  const record = latestOtps[0];

  if (isExpired(record.expiry_time)) {
    return otpError(400, 'OTP expired');
  }

  const currentAttempts = Number(record.attempt_count ?? 0);
  if (currentAttempts >= maxAttempts) {
    return otpError(400, 'OTP attempts exceeded');
  }

  const providedOtp = String(otp).trim();
  if (!/^\d{6}$/.test(providedOtp)) {
    const nextAttempts = currentAttempts + 1;
    await strapi.entityService.update(OTP_UID, record.id, {
      data: {
        attempt_count: nextAttempts,
      },
    });

    const attemptsRemaining = Math.max(0, maxAttempts - nextAttempts);
    return otpError(400, 'Invalid OTP', { attemptsRemaining });
  }

  const providedHash = hashOtp(providedOtp, salt);
  const matches = timingSafeEqualHex(providedHash, record.hashed_otp);

  if (!matches) {
    const nextAttempts = currentAttempts + 1;
    await strapi.entityService.update(OTP_UID, record.id, {
      data: {
        attempt_count: nextAttempts,
      },
    });

    const attemptsRemaining = Math.max(0, maxAttempts - nextAttempts);
    return otpError(400, 'Invalid OTP', { attemptsRemaining });
  }

  await strapi.entityService.update(OTP_UID, record.id, {
    data: { verified: true },
  });

  await subscriberManager.markVerified(strapi, {
    ...subscriberData,
    email,
  });

  // Remove any other inactive OTP records for hygiene
  await strapi.db.query(OTP_UID).deleteMany({
    where: { email, verified: false },
  });

  return {
    message: 'Subscription successful',
  };
};

module.exports = {
  requestOtp,
  verifyOtp,
};

