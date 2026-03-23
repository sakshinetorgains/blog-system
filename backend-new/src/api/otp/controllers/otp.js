'use strict';

const { factories } = require('@strapi/strapi');
const otpManager = require('../services/otp-manager');

module.exports = factories.createCoreController('api::otp.otp', ({ strapi }) => {
  const toErrorResponse = (ctx, result) => {
    const meta = result.meta && typeof result.meta === 'object' ? result.meta : {};
    return ctx
      .status(result.status)
      .send({ error: { message: result.message }, ...meta });
  };

  const normalizeSubscription = (body) => {
    const payload = body?.data ?? body ?? {};
    const phoneNum =
      payload.phone === undefined || payload.phone === null ? null : String(payload.phone);
    const phoneDigits =
      phoneNum === null ? null : phoneNum.replace(/[^\d]/g, "");
    return {
      fullname: payload.fullname ? String(payload.fullname).trim() : null,
      email: payload.email ? String(payload.email).trim().toLowerCase() : null,
      phone: phoneDigits && phoneDigits.length > 0 ? phoneDigits : null,
      organization: payload.organization ? String(payload.organization).trim() : null,
      interests: Array.isArray(payload.interests) ? payload.interests : [],
      source: payload.source ? String(payload.source) : 'Blog',
    };
  };

  const normalizeSubscriberData = (data) => {
    const payload = data ?? {};
    const phoneNum =
      payload.phone === undefined || payload.phone === null ? null : String(payload.phone);
    const phoneDigits =
      phoneNum === null ? null : phoneNum.replace(/[^\d]/g, "");
    return {
      fullname: payload.fullname ? String(payload.fullname).trim() : null,
      email: payload.email ? String(payload.email).trim().toLowerCase() : null,
      phone: phoneDigits && phoneDigits.length > 0 ? phoneDigits : null,
      organization: payload.organization ? String(payload.organization).trim() : null,
      interests: Array.isArray(payload.interests) ? payload.interests : [],
      source: payload.source ? String(payload.source) : 'Blog',
    };
  };

  return {
    // Backward-compatible endpoint (older frontend called POST /otp).
    async otp(ctx) {
      const normalized = normalizeSubscription(ctx.request.body);

      if (!normalized.email || !normalized.fullname) {
        return ctx.badRequest('Required fields missing');
      }

      const result = await otpManager.requestOtp(strapi, normalized);
      if (result?.status) return toErrorResponse(ctx, result);

      return ctx.send(result);
    },

    async verifyOtp(ctx) {
      const { email, otp, data } = ctx.request.body ?? {};

      if (!email) return ctx.badRequest('Email required');
      if (!otp) return ctx.badRequest('OTP required');

      const result = await otpManager.verifyOtp(strapi, {
        email: String(email).trim().toLowerCase(),
        otp,
        subscriberData: normalizeSubscriberData(data),
      });

      if (result?.status) return toErrorResponse(ctx, result);

      return ctx.send(result);
    },
  };
});

