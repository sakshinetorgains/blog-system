'use strict';

/**
 * subscribe controller
 */

// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::subscribe.subscribe');

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreController(
  'api::subscribe.subscribe',
  ({ strapi }) => ({
    async subscribe(ctx) {
      const otpManager = require('../../otp/services/otp-manager');

      const payload = ctx.request.body?.data ?? ctx.request.body ?? {};
      const {
        fullname,
        email,
        phone,
        organization,
        interests,
        source,
      } = payload;

      if (!email || !fullname) {
        return ctx.badRequest('Required fields missing');
      }

      const phoneDigits =
        phone === undefined || phone === null ? null : String(phone);
      const normalizedPhone =
        phoneDigits === null
          ? null
          : phoneDigits.replace(/[^\d]/g, "");

      const normalized = {
        fullname: String(fullname).trim(),
        email: String(email).trim().toLowerCase(),
        phone:
          normalizedPhone && normalizedPhone.length > 0
            ? normalizedPhone
            : null,
        organization: organization ? String(organization).trim() : null,
        interests: Array.isArray(interests) ? interests : [],
        source: source ? String(source) : 'Blog',
      };

      try {
        const result = await otpManager.requestOtp(strapi, normalized);
        if (result?.status) {
          ctx.status = result.status;
          return ctx.send({
            error: { message: result.message },
            ...result.meta,
          });
        }
        return ctx.send(result);
      } catch (err) {
        strapi.log.error('Subscribe OTP error', err);
        ctx.status = 500;
        return ctx.send({ error: { message: 'Something went wrong' } });
      }
    }
  })
);