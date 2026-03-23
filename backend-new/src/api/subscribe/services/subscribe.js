'use strict';

/**
 * subscribe service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::subscribe.subscribe');
