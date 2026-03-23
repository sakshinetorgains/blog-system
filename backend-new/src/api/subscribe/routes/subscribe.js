'use strict';

/**
 * subscribe router
 */

// const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::subscribe.subscribe');


module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/subscribe',
            handler: 'subscribe.subscribe',
            config: {
                auth: false,
            },
        },
    ],
};