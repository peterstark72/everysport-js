#!/usr/bin/env node

var everysport = require('../');

var cmd = process.argv[2];
var leagueId = Number(process.argv[3]);
var COMMANDS = ["standings", "events"];
var group, row;

var api = everysport(process.env.EVERYSPORT_APIKEY);

var dateFormat = new Intl.DateTimeFormat("se-sv", {"timeZone": "Europe/Copenhagen"});

if (isNaN(leagueId)) {
    return console.error("Enter a valid Everysport League ID");
}

if (COMMANDS.indexOf(cmd) === -1) {
    return console.error("Commands: \nstandings - current standings\nevents - events");   
}

if (cmd === "standings") {
    api.standings(leagueId)
        .on('loaded', function (data) {
            for (group in data) {
                for (row in data[group].standings) {
                    console.log(data[group].standings[row].team.name, data[group].standings[row].stats.map(function (d) {return d.value; }).join(","));
               }
            }
        });
} else {
    api.events()
        .league(leagueId)
        .load()
        .on('data', function (data) {
            console.log(dateFormat.format(new Date(data.startDate)), data.homeTeam.name, data.visitingTeam.name, data.homeTeamScore || "", data.visitingTeamScore || "");
        });
}


