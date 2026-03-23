'use strict';

/**
 * otp router
 */

// const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/otp',
            handler: 'otp.otp',
            config: {
                auth: false,
            },
        },
        {
            method: 'POST',
            path: '/verify-otp',
            handler: 'otp.verifyOtp',
            config: {
                auth: false,
            },
        }
    ],
};
