'use strict';

/**
 * pass service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::pass.pass');
