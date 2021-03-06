exports = module.exports = global;
var sys = require("sys");
for (var i in sys) exports[i] = sys[i];

exports.path = require("path");
exports.testDir = __dirname;
exports.fixturesDir = path.join(__dirname, "fixtures");
exports.libDir = path.join(testDir, "../lib");

exports.antinode = require(path.join(libDir, "antinode"));
exports.http = require('http');
exports.fs = require('fs');

exports.settings = {
    "port": 12346, 
    "hosts" : {
        "examplevirtualhost.com" : {
            "root" : path.join(fixturesDir,"examplevirtualhost.com")
        }
    },
    "default_host" : {
        "root": path.join(fixturesDir,"default-host")
    },
    "log_level": antinode.log_levels.ERROR
};


/* Testing helper functions */

/** Make an HTTP req (given parameters in req), and test the response
 * test: The nodeunit test object
 *
 * req.method:  HTTP request method
 * req.headers: HTTP request headers
 * req.pathname: HTTP Request resource
 * 
 * expected_res represents the expected HTTP Response.
 * expected_res.statusCode
 * expected_res.body
 * Leave any of these values undefined, and they won't be tested
 */
exports.test_http = function(test, req, expected_res, callback) {
    var client = http.createClient(settings.port, 'localhost');
    var r = client.request(req.method, req.pathname, req.headers);
    r.addListener('response',function(response){
        if (expected_res.statusCode) {
            test.equals(response.statusCode, expected_res.statusCode);
        }
        if (expected_res.body) {
            response.setEncoding('binary');
            var offset = 0;
            response.addListener('data', function (chunk) {
                var expected_chunk = expected_res.body.substring(offset, offset+chunk.length);
                test.equals(chunk.length, expected_chunk.length);
                test.equals(chunk, expected_chunk);
                offset += chunk.length;
            });
            response.addListener('end', callback);
        }
        else {
            return callback();
        }
    });
    r.end();
};
