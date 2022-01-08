'use strict';

/**
 *  pass controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::pass.pass');
