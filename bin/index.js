#!/usr/bin/env node

var everysport = require('../')(process.env.EVERYSPORT_APIKEY);
var cmd = process.argv[2];
var leagueId = Number(process.argv[3]);
var COMMANDS = ["standings", "upcoming", "finished"];
var group, row;

if (isNaN(leagueId)) {
    return console.error("Enter a valid Everysport League ID");
}

if (COMMANDS.indexOf(cmd) === -1) {
    return console.error("Commands: \nstandings - current standings\nupcoming - upcoming events\nfinished - finished events");   
}

if (cmd === "standings") {
    everysport
        .standings(leagueId)
        .on('loaded', function (data) {
            for (group in data) {
                for (row in data[group].standings) {
                    console.log(data[group].standings[row].team.name, data[group].standings[row].stats.map(function (d) {return d.value; }).join(","));
               }
            }
        });
} else {
    everysport.events
        .league(leagueId)
        .status(cmd)
        .load()
        .on('data', function (data) {
            console.log(data.startDate, data.homeTeam.name, data.visitingTeam.name);
        });
}


