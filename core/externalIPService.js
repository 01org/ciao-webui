/*Pool service component
  This is a client implementation to handle Ciao's  external-ip API.
*/

var externalIPService = function (adapter, tokenManager) {
};

// listMappedIPs
// Method: GET
externalIPService.prototype.listMappedIPs = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
    };
};

// mapExternalIP
// Method: POST
externalIPService.prototype.mapExternalIP = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
    };
};

// unmapExternalIP
// Method: DELETE
externalIPService.prototype.unmapExternalIP = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {
    };
};

module.exports = externalIPService;
