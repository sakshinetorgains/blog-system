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
            console.log("reached in the api ====>");
            console.log(ctx.request.body.data);
            const {
                fullname,
                email,
                phone,
                organization,
                interests,
                source,
            } = ctx.request.body.data;

            if (!email || !fullname) {
                return ctx.badRequest("Required fields missing");
            }
            const existing = await strapi.db
                .query('api::subscribe.subscribe')
                .findOne({ where: { email } });

            if (existing && existing.verified) {
                return ctx.badRequest("You have already subscribed");
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            await strapi.db.query('api::otp.otp').deleteMany({
                where: { email }
            });
            if (!existing) {
                await strapi.db.query('api::subscribe.subscribe').create({
                    data: {
                        fullname,
                        email,
                        phone,
                        organization,
                        interests,
                        source,
                        verified: false
                    }
                });
            }
            await strapi.db.query('api::otp.otp').create({
                data: {
                    email,
                    otp,
                    expiresAt,
                    isUsed: false
                }
            });

            console.log(`OTP for ${email}: ${otp}`);

            return { message: "OTP sent successfully" };
        }
    })
);