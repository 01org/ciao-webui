/*Block service component
  This is a client implementation for openstack's block storage api
*/

var blockService = function (adapter, tokenManager) {
    this.adapter = adapter;
    this.tokenManager = tokenManager;
};

blockService.prototype.getVolumes = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        var uri = "/v2/"+req.params.tenant+"/volumes";
        return adapter.onSuccess((data) => res.send(data.json))
            .onError((data) => res.send(data))
            .get(uri,req.session.token);
    };
};

blockService.prototype.getVolumesDetail = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        var uri = "/v2/"+req.params.tenant+"/volumes/detail";
        return adapter.onSuccess((data) => res.send(data.json))
            .onError((data) => res.send(data))
            .get(uri,req.session.token);
    };
};

blockService.prototype.deleteVolume = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        var uri = "/v2/"+req.params.tenant+"/volumes/"+req.params.volume_id;
        return adapter.onSuccess((data) => res.send(data.json))
            .onError((data) => res.send(data))
            .delete(uri,req.session.token);
    };
};

blockService.prototype.createVolume = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        var uri = "/v2/"+req.params.tenant+"/volumes";

        var volume = req.body.volume? req.body :{ volume: {
            size:req.body.size,
            name: req.body.name
        }};
        return adapter.onSuccess((data) => res.send(data.json))
            .onError((data) => res.send(data))
            .post(uri,volume,req.session.token);
    };
};

blockService.prototype.updateVolume = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        var uri = "/v2/"+req.params.tenant+"/volumes/"+req.params.volume_id;

        var volume = req.body.volume? req.body :{ volume: {
            size:req.body.size,
            name: req.body.name
        }};
        return adapter.onSuccess((data) => res.send(data.json))
            .onError((data) => res.send(data))
            .put(uri,volume,req.session.token);
    };
};

// In order to attach volumes a json object with "os-attach" field is required.
// os-attach is a json object with following parameters:
// instance_uid (optional), host_name(optional), mountpoint(optional)
// NOTE: at least one of 3 optional parameters is required.
blockService.prototype.attachVolume = function() {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
        var uri = "/v2/"+req.params.tenant + "/volumes/"
                + req.params.volume_id
                + "/action";
        // if req.body is well built, use it as os_attach object
        // otherwise, attempt to retrieve isntance_uuid value to construct it
        var os_attach = req.body["os-attach"]?req.body:{
            "os-attach":{
                "instance_uuid":req.body.instance_uuid,
                "mountpoint":req.body.mountpoint
            }
        };
        // validate mountpoint
        if (os_attach['os-attach'].mountpoint == undefined ||
            os_attach['os-attach'].mountpoint == null) {
            os_attach['os-attach'].mountpoint = "/dev/vdb";
        }
        return adapter.onSuccess((data) => res.send(data.json))
            .onError((data) => res.send(data))
            .post(uri, os_attach, req.session.token);
    };
};

module.exports = blockService;
