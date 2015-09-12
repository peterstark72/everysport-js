/*
    
    Everysport for NodejS

    by Peter Stark

*/

var url             = require('url');
var https           = require('https');
var http            = require('http');
var EventEmitter    = require('events').EventEmitter;

var API_HOST = "api.everysport.com",
    API_VERSION = "v1";

function loadJSON(urlObj) {

    var emitter = new EventEmitter();

    var body = "",
        obj,
        req;

    //console.log("Requesting: ", url.format(urlObj));

    if (urlObj.protocol === "https:") {
        req = https.get(url.format(urlObj));
    } else {
        req = http.get(url.format(urlObj));
    }

    req.on('response', function (res) {

        res.setEncoding('utf-8');

        res.on('data', function (data) {
            body += data;
        });

        res.on('end', function () {
            try {
                obj = JSON.parse(body);
                emitter.emit('loaded', obj);
            } catch (err) {
                emitter.emit('error', err);
            }
        });
    });

    req.on('error', function (e) {
        emitter.emit('error', e);
    });

    return emitter;
}

function slice(args) {
    var i,
        max,
        result = [];
    for (i = 0, max = args.length; i < max; i++) {
        result.push(args[i]);
    }
    return result;
}


function Query(apikey, entity) {
    this.entity = entity;
    this.urlObj = {
        'protocol': "http",
        'host': API_HOST,
        'pathname': [API_VERSION, entity].join("/"),
        'query': {
            'apikey': apikey,
            'fields': 'all'
        }
    };

    function filter(name) {
        if (arguments.length > 1) {
            this.urlObj.query[name] = slice(arguments).slice(1).join(",");
        }
        return this;
    }

    this.league = filter.bind(this, "league");
    this.team = filter.bind(this, "team");
    this.sport = filter.bind(this, "sport");
    this.status = filter.bind(this, "status");

    return this;
}

Query.prototype.load = function () {

    var self = this;

    var emitter = new EventEmitter();

    var url = self.urlObj;

    var onerror = function (err) {
        // Internal error handler
        emitter.emit('error', err);
    };

    var ondata = function (data) {
        var i,
            max,
            index;

        if (data.hasOwnProperty('status')) {
            return onerror(new Error(data.messages.join("\n")));
        }

        for (i = 0, max = data[self.entity].length; i < max; i++) {
            emitter.emit('data', data[self.entity][i]);
        }

        index = data.metadata.offset + data.metadata.count;
        if (index < data.metadata.totalCount) {
            // Pagination
            url.query.offset = index;
            loadJSON(url)
                .on('loaded', ondata)
                .on('error', onerror);
        } else {
            emitter.emit('end');
        }
    };

    loadJSON(url)
        .on('loaded', ondata)
        .on('error', onerror);

    return emitter;
};

function StandingsQuery(apikey, leagueId) {

    this.emitter = new EventEmitter();
    this.urlObj = {
        'protocol': "http",
        'host': API_HOST,
        'pathname': [API_VERSION, "leagues", leagueId, "standings"].join("/"),
        'query': {
            'apikey': apikey
        }
    };
}

StandingsQuery.prototype.load = function () {

    var emitter = new EventEmitter();

    loadJSON(this.urlObj)
        .on('loaded', function (data) {
            emitter.emit('data', data.groups);
        })
        .on('error', function (err) {
            emitter.emit('error', err);
        });
    return emitter;
};

function EverysportAPI(apikey) {
    this.events = new Query(apikey, "events");
    this.standings = function (leagueId) {
        return new StandingsQuery(apikey, leagueId);
    };
}

module.exports = function (apikey) {
    return new EverysportAPI(apikey);
};
