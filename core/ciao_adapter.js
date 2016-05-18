// CIAO adapter

// ciaoAdapter constructor
// If no configuration file is set for ciao, hostname, port and protocol
// may be set in this function.
var ciaoAdapter = function (hostname, port, protocol) {
    if (!hostname || !port || !protocol) {
        var config = getConfig();
        this.host = config.host;
        this.port = config.port;
        this.protocol = config.protocol;
        this.http = require((config.protocol)?config.protocol:"http");
    } else {
        this.protocol = protocol;
        this.host = hostname;
        this.port = port;
        this.http = require(this.protocol);
    }
};

ciaoAdapter.prototype.onSuccess = function (callback) {
    var ca = Object.assign(new ciaoAdapter(this.host, this.port, this.protocol),
                           this);
    ca.successCallback = callback;
    return ca;
};

ciaoAdapter.prototype.onError = function (callback) {
    var ca = Object.assign(new ciaoAdapter(this.host, this.port, this.protocol),
                           this);
    ca.errorCallback = callback;
    return ca;
};

ciaoAdapter.prototype.delete = function (path,token, next){
    var options = getHttpOptions(this.host,
                                 this.port,
                                 path,
                                 "DELETE",
                                 this.protocol,
                                 token);
    var response;
    if (!next) {
        response = new httpResponse(this.successCallback, this.errorCallback);
    } else {
        response = new httpResponse(next);
    }
    var req = this.http.request(options, response.callback);
    req.on('error', function (err) {
        if (process.env.NODE_ENV != 'production')
            console.log("ERROR: %s",err);
        next();
    });
    req.end();
    return response;
};

// Use Path as the endpoint we want to request in accordance to the API
ciaoAdapter.prototype.get = function (path,token, next){
    var options = getHttpOptions(this.host,
                                 this.port,
                                 path,
                                 "GET",
                                 this.protocol,
                                 token);
    var response;
    if (!next) {
        response = new httpResponse(this.successCallback, this.errorCallback);
    } else {
        response = new httpResponse(next);
    }
    var req = this.http.request(options, response.callback);
    req.on('error', function (err) {
        if (process.env.NODE_ENV != 'production')
            console.log("ERROR: %s",err);
        next();
    });
    req.end();
    return response;
};

ciaoAdapter.prototype.post = function (path, data,token, next){
    var options = getHttpOptions(this.host,
                                 this.port,
                                 path,
                                 "POST",
                                 this.protocol,
                                 token);
    var dataString = JSON.stringify(data);
    // get content-length and add to header
    options.headers["Content-Length"] = dataString.length;
    var response;
    if (!next) {
        response = new httpResponse(this.successCallback, this.errorCallback);
    } else {
        response = new httpResponse(next);
    }
    var req = this.http.request(options, response.callback);
    req.on('error', function (err) {
        if (process.env.NODE_ENV != 'production')
            console.log("ERROR: %s",err);
        next();
    });
    req.write(dataString);
    req.end();
    return response;
};

// Declarative style methods for CIAO Adapter
// Note: declarative methods are not "RESTful" use for  testing purposes only
// DO NOT implement more methods than required, use .get, .post instead
// by providing an URI to access the CIAO API

ciaoAdapter.prototype.getFlavors = function (tenant_id,token, next){
    var options = getHttpOptions(this.host,
                                 this.port,
                                 "/v2.1/" + tenant_id + "/flavors",
                                 "GET",
                                 this.protocol,
                                 token);
    var response;
    if (!next) {
        response = new httpResponse(this.successCallback, this.errorCallback);
    } else {
        response = new httpResponse(next);
    }
    var req = this.http.request(options, response.callback);
    req.on('error', function (err) {
        if (process.env.NODE_ENV != 'production')
            console.log("ERROR: %s",err);
        next();
    });
    req.end();
    return response;
};

ciaoAdapter.prototype.getServersDetail = function (tenant_id,token, next){
    var options = getHttpOptions(this.host,
                                 this.port,
                                 "/v2.1/" + tenant_id + "/servers/detail",
                                 "GET",
                                 this.protocol,
                                 token);
    var response;
    if (!next) {
        response = new httpResponse(this.successCallback, this.errorCallback);
    } else {
        response = new httpResponse(next);
    }
    var req = this.http.request(options, response.callback);
    req.on('error', function (err) {
        if (process.env.NODE_ENV != 'production')
            console.log("ERROR: %s",err);
        if (this.errorCallback)
            this.errorCallback();
        else if (next)
            next();
    }.bind(this));
    req.end();
    return response;
};

// Helper functions
// Return json configuration from ciao_config.json file
var getConfig = function () {
    var file = global.CONFIG_FILE?
        global.CONFIG_FILE : "./config/ciao_config.json";
    var fs = require('fs');
    var config = JSON.parse(fs.readFileSync(file, 'utf8'));
    //GLOBAL overwrite
    var result;
    if (config[process.env.NODE_ENV])
        result = config[process.env.NODE_ENV].controller;
    else
        result = {};
    if (global.CONTROLLER_ADDR)
        result.host = global.CONTROLLER_ADDR;
    if (global.CONTROLLER_PORT)
        result.port = global.CONTROLLER_PORT;
    if (global.PROTOCOL)
        result.protocol = global.PROTOCOL;
    return result;
};

// Use this helper function to build an authenticated request, specify HTTP or
// HTTPS protocol, HTTP method, host and port.
var getHttpOptions = function (host, port, path, method, protocol, token) {
    var options = {
        host: host,
        port: port,
        method: method,
        path: (protocol+ "://" + host + ":" + port + path),
        headers: {
            "Content-Type":"application/json",
            "X-Auth-Token": token,
            "X-Service-Token": token
        }
    };

    // Accept Unauthorized Certificates
    options.rejectUnauthorized = false;
    return options;
};

// This httpResponse helper will handle and store response in JSON format
// while accepting a callback function
var httpResponse = function (next, errCallback) {
    this.callback = function (response) {
        var chunk = '';

        response.on('error', function (err) {
            this.json = {error:err};
            if (errCallback)
                errCallback(this);
            else
                next(this);
        });

        response.on('data', function(c){chunk += c;});

        response.on('end', function() {
            this.response = response;
            this.raw = chunk;
            this.statusCode = response.statusCode;
            this.json = {};
            if (response.statusCode == 200) {
                try {
                    this.json = JSON.parse(chunk);
                }catch(e){
                    this.json = {error:e};
                }
            } else {
                this.json = {error:response.statusCode};
            }
            next(this); // callback passed
        }.bind(this));
    }.bind(this);
};

module.exports = ciaoAdapter;
