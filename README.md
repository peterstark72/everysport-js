# everysport-js
NodeJS wrapper for the (Everysport API)[https://github.com/menmo/everysport-api-documentation]

````
var everysport = require("./everysport")({YOUR API KEY});

var PINGISLIGAN_DAM = 72064,
    DIV_3_HERRAR = 72088;

everysport
    .events
    .league(PINGISLIGAN_DAM)
    .status("upcoming")
    .load()
    .on("data", function (data) {
        console.log(data.startDate, data.homeTeam.name);
    })
    .on("error", function (err) {
        console.log(err);
    });


everysport
    .standings(PINGISLIGAN_DAM)
    .load()
    .on("data", function (data) {
        var group;
        for (group in data) {
            console.log(data[group]);
        }
    })
    .on("error", function (err) {
        console.log(err);
    });
```
