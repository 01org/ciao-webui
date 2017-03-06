/*Pool service component
  This is a client implementation to handle Ciao's  Pool API.
*/

var poolService = function (adapter, tokenManager) {
    this.adapter = adapter;
    this.tokenManager = tokenManager;
};

// Begins section for IP Pools

// listPools:
// Method: GET
// Returns a list of  pools
poolService.prototype.listPools = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {

    };
};

// addPool
// Method: POST
// Delivers a new pool request.
// On success: Expects http statusNoContent
poolService.prototype.addPool = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {

    };
};

// addToPool
// Method: POST
// Delivers a new pool request.
// On success: Expects http statusNoContent
poolService.prototype.addToPool = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {

    };
};

// deletePool
// Method: DELETE
// Delivers request to delete pool
// On success: Expects http statusNoContent
poolService.prototype.deletePool = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {

    };
};

// deleteSubnet
// Method: DELETE
// Delivers request to delete subnet from
// On success: Expects http statusNoContent
poolService.prototype.deleteSubnet = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {

    };
};

// deleteExternalIP
// Method: DELETE
// Delivers request to delete external IP from pool
// On success: Expects http statusNoContent
poolService.prototype.deleteExternalIP = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {

    };
};

// listPools:
// Method: GET
// Returns a single pool object
poolService.prototype.showPool = function () {
    var adapter = this.adapter;
    var tokenManager = this.tokenManager;
    return function (req, res, next) {

    };
};

module.exports = poolService;
