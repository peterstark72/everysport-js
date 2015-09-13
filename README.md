# everysport-js
NodeJS wrapper for the [Everysport API](https://github.com/menmo/everysport-api-documentation).

## Example Usage
```
var everysport = require("./everysport")(process.env.EVERYSPORT_APIKEY);

var PINGISLIGAN_DAM = 72064,
    DIV_3_HERRAR = 72088,
    SPORT_BORDTENNIS = 8;

/** Loads Bordtennis (table tennis) upcoming events */
everysport.events
    .league(PINGISLIGAN_DAM, DIV_3_HERRAR)
    .status("upcoming")
    .load()
    .on("data", function (data) {
        console.log(data.startDate, data.homeTeam.name);
    })
    .on("error", function (err) {
        console.log(err);
    });

/** Prints all Bordtennis (table tennis) leagues */
everysport.leagues
    .sport(SPORT_BORDTENNIS)
    .load()
    .on("data", function (data) {
        console.log(data.name);
    });

/** Prints all Everysport sports */
everysport.sports
    .load()
    .on("data", function (data) {
        console.log(data);
    });

/** Prints Pingisligan Standings */
everysport
    .standings(PINGISLIGAN_DAM)
    .on('loaded', function (data) {
        console.log(data);
    });
```
## Command line
Get the LeagueID from everysport.com as described [here](https://github.com/menmo/everysport-api-documentation/blob/master/basics/formats_and_terms.md#league-id).

Current standings
```
everysport standings <leagueId>
```

Upcoming events:
```
everysport upcoming <leagueId>
```
