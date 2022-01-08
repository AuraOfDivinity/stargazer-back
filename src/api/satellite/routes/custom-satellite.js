module.exports = {
    routes: [
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/satellites/suggested',
            handler: 'satellite.getSuggested',
        },

        { // Path defined with a URL parameter
            method: 'POST',
            path: '/satellites/susbcribe',
            handler: 'satellite.subscribeToSatellite',
        }
    ]
}