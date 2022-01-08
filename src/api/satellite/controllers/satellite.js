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

    async getSubscribed(ctx) {
        try {
            return 'ok'
        } catch (err) {
            return err
        }
    },

    async subscribeToSatellite(ctx) {
        let user = ctx.state.user;
        const observer_lat = user.user_lat
        const observer_long = user.user_long
        const observer_alt = user.user_lat
        const days = 10;
        const min_visibility = 10;
        const { norad_id } = ctx.query

        console.log(user)

        try {
            console.log(`lat: ${observer_lat} long:${observer_long} alt: ${observer_alt}, days: ${days}, mv: ${min_visibility}, norad_id, ${norad_id}`)

            const res = await axios.get(`${process.env.N2YO_BASE}/visualpasses/${norad_id}/${observer_lat}/${observer_long}/${observer_alt}/${days}/${min_visibility}
                /?apiKey=${process.env.N2YO_KEY}`)


            if (!res.data.passes) {
                return {
                    passesAvailable: false
                }
            }
            else {
                res.data.passesAvailable = true

                let passData = []
                let nPasses = passData.length
                let i = 0;

                const sat = await strapi.entityService.create('api::satellite.satellite', {
                    data: {
                        satellite_name: res.data.info.satname,
                        satellite_norad_id: res.data.info.satid,
                    },
                });

                res.data.passes.forEach(async (pass) => {
                    const passcreated = await strapi.entityService.create('api::pass.pass', {
                        data: {
                            start_utc: pass.startUTC,
                            end_utc: pass.endUTC,
                            start_azimuth: pass.startAz,
                            start_azimuth_compass: pass.startAzCompass,
                            end_azimuth: pass.endAz,
                            end_azimuth_compass: pass.endAzCompass,
                            duration: pass.duration
                        },
                    });
                    passData.push(passcreated.id)
                })

                const satret = await strapi.entityService.update('api::satellite.satellite', sat.id, {
                    data: {
                        passes: passData
                    },
                });

                const userInfo = await strapi.db.query('plugin::users-permissions.user').findOne({
                    select: ['email'],
                    where: { id: user.id },
                    populate: [`subscribed_satellites`],
                });

                let satData = []

                userInfo.subscribed_satellites.forEach((sat) => {
                    satData.push(sat.id)
                })

                satData.push(satret.id)

                let updatedUser = await strapi.db.query('plugin::users-permissions.user')
                    .update({ where: { id: user.id }, data: { subscribed_satellites: satData } });

                // await strapi.query('user', 'users-permissions').update({ id: user.id }, { 'subscribed': addressList });
                res.data.user = updatedUser
            }
            return res.data
        } catch (err) {
            console.log(err)
            ctx.body = err;
        }
    }
}));
