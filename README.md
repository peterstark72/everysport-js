# everysport-js
NodeJS wrapper for the [Everysport API](https://github.com/menmo/everysport-api-documentation).

## Example Usage
```
var everysport = require("./everysport");

var api = everysport(process.env.EVERYSPORT_APIKEY);

var PINGISLIGAN_DAM = 72064,
    DIV_3_HERRAR = 72088,
    SPORT_BORDTENNIS = 8;

/** Loads Bordtennis (table tennis) upcoming events */
api.events()
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
api.leagues()
    .sport(SPORT_BORDTENNIS)
    .load()
    .on("data", function (data) {
        console.log(data.name);
    });

/** Prints all Everysport sports */
api.sports()
    .load()
    .on("data", function (data) {
        console.log(data);
    });

/** Prints Pingisligan Standings */
api
    .standings(PINGISLIGAN_DAM)
    .on('loaded', function (data) {
        console.log(data);
    });
```
## Command line
Get the LeagueID from everysport.com as described [here](https://github.com/menmo/everysport-api-documentation/blob/master/basics/formats_and_terms.md#league-id).

Standings
```
everysport standings <leagueId>
```

Events:
```
everysport events <leagueId>
```
