'use strict';

/**
 *  satellite controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');

module.exports = createCoreController('api::satellite.satellite', ({ strapi }) => ({
    // Obtaining nearby satellites for the user from n2yo api

    async getSuggested(ctx) {
        try {
            const { observer_lat, observer_long, observer_alt, search_radius, category_id } = ctx.query
            console.log(`lat: ${observer_lat} long:${observer_long} alt: ${observer_alt}, sr: ${search_radius}, ci: ${category_id}`)

            const res = await axios.get(`${process.env.N2YO_BASE}/above/${observer_lat}/${observer_long}/${observer_alt}/${search_radius}/${category_id}
                /?apiKey=${process.env.N2YO_KEY}`)

            return res.data
        } catch (err) {
            console.log(err)
            ctx.body = err;
        }
    },
}));
