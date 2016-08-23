var spawn = require('child_process').fork;
var querystring = require('querystring');

var tenantService = function (adapter, tokenManager) {
    this.adapter = adapter;
    this.tokenManager = tokenManager;
};

tenantService.prototype.serversDetailCount = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        tokenManager.onSuccess((t) => {
            var uri = "/v2.1/" + req.params.tenant + "/servers/detail";
            var token = (t)? t: req.session.token;
            adapter.onSuccess((data) => {
                if (data.json) {
                    var rcount;
                    try {
                        rcount = (data.json.total_servers)?
                            data.json.total_servers
                            :data.json.servers.length;
                        ;
                    } catch(e){
                        rcount = 0;
                    } finally {
                        res.send({count: rcount});
                    }
                } else {
                    res.send({count:0});
                }
            }).onError((data) => {
                res.send({error:data.statusCode});
            }).get(uri,token);
        })
            .onError((resp) => {
                if(resp) {
                    res.status(401)
                        .send({error:"Not authorized"})
                        .end();
                } else {
                    res.status(500)
                        .send({error:500});
                }
            })
            .validate(req, res);
    };
};

tenantService.prototype.serversDetail = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        var query = '?' + querystring.stringify(req.query);
        if (process.env.NODE_ENV != 'production') {
            console.log('servers/detail :query string:', query);
        }
        tokenManager.onSuccess((t) => {
            var uri = "/v2.1/" + req.params.tenant + "/servers/detail"+query;
            var token = (t)? t: req.session.token;
            adapter.onSuccess((data) => {
                if (data.json) {
                    var servers = data.json.servers;
                    if (Array.prototype.isPrototypeOf(servers)) {
                        res.send(servers
                                 .map((value) => {
                                     var image = value.image.id;
                                     var address = value.addresses.private[0];
                                     return {
                                         "id": value.id,
                                         "status": value.status,
                                         "Node ID": value.hostId,
                                         "IP Address": address.addr,
                                         "MAC address":address[
                                             "OS-EXT-IPS-MAC:mac_addr"],
                                         "Image": image
                                     };
                                 }));
                    } else {
                        res.send({servers:[]});
                    }
                } else {
                    res.send({servers:[]});
                }
            }).onError((data) =>
                       res.send({error:data.statusCode})).get(uri,token);
        })
            .onError((resp) => {
                if(resp) {
                    res.status(500)
                        .send({"servers":[], error: resp.error})
                        .end();
                } else {
                    res.status(500)
                        .send({"servers":[]});
                }
            }).validate(req,res);
    };
};

tenantService.prototype.getServer = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        var uri = "/v2.1/" + req.params.tenant + "/servers/" +
            req.params.server;
        adapter.onSuccess((data) => res.send(data.json))
            .onError((data) => res.send({error:data.statusCode}))
            .get(uri,req.session.token);
    };
};

tenantService.prototype.flavors = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        tokenManager.onSuccess(
            function (t) {
                var uri = "/v2.1/" + req.params.tenant + "/flavors";
                adapter.onSuccess(function(data) {
                        // Temporal optimization
                        // Cache current workload information.
                        // Workloads aren't likely to change while UI is
                        // running. If workloads change, users must logout and
                        // login again..
                        // TODO: remove once a better optimization
                        // is implemented
                        if (!req.session.workloads ||
                            req.session.workloads == []) {
                            req.session.workloads = data.json.flavors;
                        }
                        res.send({flavors:req.session.workloads});
                    }.bind(req))
                    .onError((data) => res.send({error:data.statusCode}))
                    .get(uri,req.session.token);
            }.bind(req))
            .onError( () => {
                res.status(500).end();
            })
            .validate(req, res);
    };
};

//TODO: Flavor details function is not working when isolated from data.js
tenantService.prototype.flavorsDetail = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        tokenManager.onSuccess(function (t){
            var query = '?' + querystring.stringify(req.query);
            if (process.env.NODE_ENV != 'production') {
                console.log('servers/detail :query string:', query);
            }
            // Implement a processing flag to prevent overload
            if (!req.session.wrefresh)
                req.session.wrefresh = false;
            if (req.session.wrefresh == false && req.session.workloads)  {
                var uri = "/v2.1/" + req.params.tenant + "/servers/detail" +
                    query;
                req.session.wrefresh = true;

                // Spawn new process to handle
                var child = spawn('./core/helpers/flavorDetails.js');
                // send message to child
                var globals = {
                    controller_addr:global.CONTROLLER_ADDR,
                    controller_port:global.CONTROLLER_PORT,
                    protocol: global.PROTOCOL
                };
                child.send(JSON.stringify({
                    uri: uri,
                    token: req.session.token,
                    workloads: req.session.workloads,
                    globals: globals
                }));
                //child.send("hello mundo");
                child.on('message', function(m) {
                    child.disconnect();
                    req.session.wrefresh = false;
                    var resp = JSON.parse(m)
                        .workloads;
                    req.session.workloads = resp;
                    res.send({flavors: resp});
                });
            }
            else {
                res.send({
                    flavors:req.session.workloads?
                        req.session.workloads:[]});
            }
        }.bind(req,res))
            .onError(() => {
                res.status(500).end();

            })
            .validate(req,res);
    };
};

tenantService.prototype.getFlavor = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        tokenManager.onSuccess((t) => {
            var uri = "/v2.1/" + req.params.tenant + "/flavors/" +
                req.params.flavor;
            var data = adapter.get(
                uri,req.session.token,
                function() {
                    //Add detailes to cached workloads
                    if (req.session.workloads)
                        var workloads = req.session.workloads
                        .map((w) => {
                            try {
                                if (w.id == req.params.flavor) {
                                    w.disk = data.json.flavor.disk;
                                }
                            }
                            finally {
                                return w;
                            }
                        });
                    req.session.workloads = workloads;
                    res.send(
                        data.json ? data.json : {error:"No data available"});
                }.bind(req));
        })
            .onError(() => {
                res.send({});
            })
            .validate(req,res);
    };
};

tenantService.prototype.createServers = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        tokenManager.onSuccess((t) => {
            var token = (t)?t:req.session.token;
            var uri = "/v2.1/" + req.params.tenant + "/servers";
            req.body.min_count = parseInt(req.body.min_count);
            req.body.max_count = parseInt(req.body.max_count);

            var server = {server:req.body};
            var data = adapter.post(uri,
                                    server,
                                    token,
                                    () => res.send(
                                        (data.json)?data.json:data.raw));
        })
            .onError(function () {
                res.status(500)
                    .end();
            })
            .validate(req, res);
    };
};

tenantService.prototype.postServersAction = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        tokenManager.onSuccess((t) => {
            var token = (t)?t:req.session.token;
            var uri = "/v2.1/" + req.params.tenant +
                "/servers/action";
            // Implemented actions are:
            // "-os-start":
            // "-os-stop"
            // " os-delete"
            var d = {};
            d["action"] = req.body.action;
            d["status"] = req.body.status;
            var data = adapter.post(uri,
                                    d,
                                    token,
                                    () => res.send(data.raw));
        }
                              )
            .validate(req, res);
    };
};

tenantService.prototype.postServerAction = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        tokenManager.onSuccess((t) => {
            var token = (t)?t:req.session.token;
            var uri = "/v2.1/" + req.params.tenant +
                "/servers/"+req.params.server + "/action";
            // Implemented actions are:
            // "-os-start":
            // "-os-stop"
            var d = {};
            d["server"] = req.body.server;
            d[req.body.action] = req.body.action;
            var data = adapter.post(uri,
                                    d,
                                    token,
                                    () => res.send(data.json));
        }
                              )
            .validate(req, res);
    };
};

// attach volume to a server
tenantService.prototype.attachVolume = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        tokenManager.onSuccess((t) => {
            var token = (t)?t:req.session.token;
            var uri = "/v2.1/" + req.params.tenant +
                    "/servers/"+req.params.server + "/os-volume_attachments";
            var volumeAttachment = req.body;
            var data = adapter.post(uri,
                                    volumeAttachment,
                                    token,
                                    () => res.send(data.json));
        }
                              )
            .validate(req, res);
    };
};


module.exports = tenantService;
