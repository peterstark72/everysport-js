/**
 * @module everysport
 * @author Peter Stark <peterstark72@gmail.com>
 *
 * @license
 * The MIT License (MIT)
 * Copyright (c) 2015 Peter Stark
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
*/

var url             = require('url');
var https           = require('https');
var http            = require('http');
var EventEmitter    = require('events').EventEmitter;

var API_HOST = "api.everysport.com",
    API_VERSION = "v1";

/** 
 * Loads JSON data
 * @param {urlObj} urlObj - The URL object representing the JSON-formatted data
 * @return {EventEmitter} 
 * @emits 'loaded' when data is loaded 
 * @emits 'error' when there is an error
*/
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


/**
 * Loads the list, including pagination if necessary
 * @returns EventEmitter that emits 'data' for each items in the list, and 
 * 'end' at the end of the list.   
 */
function loadList() {

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

        if (!data.hasOwnProperty(self.entity)) {
            // There is no data
            return emitter.emit("end");
        }

        for (i = 0, max = data[self.entity].length; i < max; i++) {
            emitter.emit('data', data[self.entity][i]);
        }

        index = data.metadata.offset + data.metadata.count;
        if (index < data.metadata.totalCount) {
            // Pagination, increase offset and request more data
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
}


/**
 * Represents a query for a list of items, such as events, sports or leagues
 * @constructor
 * @param {string} apikey - Everysport API key
 * @param {string} entity - Name of list entity, eg 'events', 'leagues'
 * @param {Array} queryParams - Array of query parameters the list supports
 */
function ListQuery(apikey, entity, queryParams) {

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

    function addQueryParam(name) {

        var i,
            max,
            values = [];

        if (arguments.length < 2) {
            return this;
        }

        for (i = 1, max = arguments.length; i < max; i++) {
            values.push(arguments[i]);
        }

        this.urlObj.query[name] = values.join(",");

        return this;
    }

    var i, max;
    for (i = 0, max = queryParams.length; i < max; i++) {
        this[queryParams[i]] = addQueryParam.bind(this, queryParams[i]);
    }

    this.load = loadList.bind(this);

    return this;
}

/**
 * Loads Standings for a given league
 * @param {string} apikey - Everysport API key
 * @param {integer} leagueId - Everysport League ID
 */
function loadStandings(apikey, leagueId) {

    var emitter = new EventEmitter();

    var urlObj = {
        'protocol': "http",
        'host': API_HOST,
        'pathname': [API_VERSION, "leagues", leagueId, "standings"].join("/"),
        'query': {
            'apikey': apikey
        }
    };

    loadJSON(urlObj)
        .on('loaded', function (data) {
            emitter.emit('loaded', data.groups);
        })
        .on('error', function (err) {
            emitter.emit('error', err);
        });
    return emitter;
}

function EverysportAPI(apikey) {

    this.events = new ListQuery(apikey, "events", ["league", "team", "sport", "status"]);
    this.leagues = new ListQuery(apikey, "leagues", ["teamClass", "sport"]);
    this.sports = new ListQuery(apikey, "sports", []);

    this.standings = function (leagueId) {
        return loadStandings(apikey, leagueId);
    };
}

module.exports = function (apikey) {
    return new EverysportAPI(apikey);
};
