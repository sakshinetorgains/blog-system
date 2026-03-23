'use strict';

/**
 * otp controller
 */

// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::otp.otp');


/**
 * otp controller
 */

const { factories } = require('@strapi/strapi')

module.exports = factories.createCoreController('api::otp.otp', ({ strapi }) => ({
    // async otp(ctx) {
    //     try {
    //         console.log("reached here ")
    //         const { email, otp } = ctx.request.body.data;
    //         console.log(email, otp)
    //         if (!otp) {
    //             return ctx.badRequest("Email and OTP are required");
    //         }

    //         const otpRecord = await strapi.db.query('api::otp.otp').findOne({
    //             where: {
    //                 email,
    //                 otp
    //             }
    //         });
    //         console.log("this is for otp record", otpRecord)

    //         if (!otpRecord) {
    //             return ctx.badRequest("Invalid or already used OTP");
    //         }
    //         // if (new Date(otpRecord.expiresAt) < new Date()) {
    //         //     return ctx.badRequest("OTP expired");
    //         // }
    //         // await strapi.db.query('api::otp.otp').update({
    //         //     where: { id: otpRecord.id }
    //         // });

    //         const subscriber = await strapi.db.query('api::subscribe.subscribe').findOne({
    //             where: { email }
    //         });
    //         console.log(subscriber)
    //         if (!subscriber) {
    //             return ctx.badRequest("Subscriber not found");
    //         }

    //         await strapi.db.query('api::subscribe.subscribe').update({
    //             where: { id: subscriber.id },
    //             data: { verified: true }
    //         });

    //         return {
    //             success: true,
    //             message: "Subscription completed successfully"
    //         };

    //     } catch (error) {
    //         console.error("VERIFY OTP ERROR:", error);

    //         return ctx.badRequest("Something went wrong");
    //     }
    // }

    async otp(ctx) {
        const { email } = ctx.request.body;

        if (!email) return ctx.badRequest("Email required");

        // 🔁 Duplicate check
        const existingUser = await strapi.entityService.findMany(
            'api::subscribe.subscribe',
            {
                filters: { email },
            }
        );

        if (existingUser.length > 0) {
            return ctx.badRequest("You have already subscribed");
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await strapi.entityService.create('api::otp.otp', {
            data: {
                email,
                otp,
                expiresAt,
                verified: false, // ✅ important here
            },
        });

        console.log("OTP:", otp); // assignment-friendly

        return ctx.send({ message: "OTP sent" });
    },

    async verifyOtp(ctx) {
        const { email, otp, data } = ctx.request.body;
        console.log("hii this is verifyotp controller");
        console.log(ctx.request.body);
        console.log("email is ==>", email)
        console.log("data==>", data)
        const records = await strapi.entityService.findMany('api::otp.otp', {
            filters: { email },
            sort: { createdAt: 'desc' },
            limit: 1,
        });

        if (!records.length) {
            return ctx.badRequest("OTP not found");
        }

        const record = records[0];
        console.log(typeof otp)
        console.log(typeof record.otp)
        // ⏳ Expiry check
        if (new Date() > new Date(record.expiresAt)) {
            return ctx.badRequest("OTP expired");
        }

        const dbOtp = String(record.otp).replace(/,/g, '').trim();
        const userOtp = String(otp).trim();

        console.log("dbOtp==>", typeof dbOtp);
        console.log("userotp==>", typeof userOtp)
        // ❌ Wrong OTP
        if (dbOtp !== userOtp) {
            return ctx.badRequest("Invalid OTP");
        }

        // ✅ Mark verified
        await strapi.entityService.update('api::otp.otp', record.id, {
            data: {
                verified: true,
            },
        });

        // ✅ Save final subscriber
        await strapi.entityService.create('api::subscribe.subscribe', {
            data: {
                ...data,
            },
        });

        return ctx.send({ message: "Subscription successful" });
    }
}))
