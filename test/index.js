var assert = require('assert');
var everysport = require('../')(process.env.EVERYSPORT_APIKEY);

var PINGISLIGAN_DAM = 72064,
    DIV_3_HERRAR = 72088,
    SPORT_BORDTENNIS = 8;

/** Loads Bordtennis (table tennis) upcoming events */
everysport.events
    .league(PINGISLIGAN_DAM, DIV_3_HERRAR)
    .status("upcoming")
    .load()
    .on("data", function (data) {
        assert(data);
    })
    .on("error", function (err) {
        console.log(err);
    });

/** Prints all Bordtennis (table tennis) leagues */
everysport.leagues
    .sport(SPORT_BORDTENNIS)
    .load()
    .on("data", function (data) {
        assert(data);
    });

/** Prints all Everysport sports */
everysport.sports
    .load()
    .on("data", function (data) {
        assert(data);
    });

/** Prints Pingisligan Standings */
everysport
    .standings(PINGISLIGAN_DAM)
    .on('loaded', function (data) {
        assert(data);
    });
