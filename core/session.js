// Core session policy handler for ciao web ui

 var sessionHandler = {

     configSession: function (req, res, next) {
         if (!req.session.authorized) {
             req.session.authorized = false;
         }
         next();
     },
     //Add keystone token to http requests
     addAuthToken: function (req, res, next) {
         console.log("Session Id:"+req.session.id);
         // TODO: this is a dummy
         res.append('token',req.session);
         next();
     },

     validateSession: function (req, res, next) {
         if (req.session.authorized == true)
             next();
         else {
             var config = {
                 title: 'Not authorized',
                 scripts: [],
                 data: {},
                 page: 'pages/401.ejs'
             };
             res.render(process.env.NODE_ENV+'_template',config);
         }
     },

     getCurrentUser: function (req,res,next) {

         if (!req.session.view) {
             req.session.view = { count:0 };
         }

         req.session.view.count++;
         console.log("user view counter: "+req.session.view.count);

         next();
     },

     getConfig: function () {
         var file = global.CONFIG_FILE?
             global.CONFIG_FILE:__dirname +"/../config/ciao_config.json";
         var fs = require('fs');
         var config = JSON.parse(fs.readFileSync(file, 'utf8'));
         var result;
         if (config[process.env.NODE_ENV])
             result = config[process.env.NODE_ENV].keystone;
         else
             result = {uri: "/v3/auth/tokens"}; //default URI v3 keystone
         // Global variable overwrite
         if (global.KEYSTONE_ADDR)
             result.host = global.KEYSTONE_ADDR;
         if (global.KEYSTONE_PORT)
             result.port = global.KEYSTONE_PORT;
         if (global.PROTOCOL)
             result.protocol = global.PROTOCOL;
         return result;
     },

     // TODO: test this function with proper username, password,and options
     keystoneAuthenticate: function (bundle, next) {
         var username = bundle.username;
         var password = bundle.password;
         var config = this.getConfig();
         var http = require((config.protocol)?config.protocol:"http");
         // if scope is set manually on identity file, it is overwritten
         if (bundle.scope) {
             config.scope = bundle.scope;
         }
         if(bundle.method && bundle.token) {
             config.method = bundle.method;
             config.token = bundle.token;
         }
         if(bundle.user_id)
             config.user_id = bundle.user_id;

         var data = this.keystoneBuildAuth(username, password, config);
         var options = { host: config.host,
                         port: config.port,
                         method:'POST',
                         path: config.protocol + '://' + config.host  +
                         ':' + config.port +
                         config.uri,
                         headers: {
                             "Content-Length": JSON.stringify(data).length,
                             "Content-Type": "application/json"
                         }
                       };

         //Accept Unauthorized Certs
         options.rejectUnauthorized = false;

         // Add a token if retrieveng scoped token from  an existing session
         if(config.token) {
             options.headers["X-Auth-Token"] = bundle.token;
         }
         // Bind result object into call back for easier access to response
         var result = new function () {
             this.callback = function (response) {
                 var chunk = '';
                 response.on('data', function(c){chunk += c;});
                 response.on('end', function() {
                     this.response = response;
                     try {
                         this.json = JSON.parse(chunk);
                     }catch(e){
                         this.json = {error:e};
                     }
                     next(); // callback passed
                 }.bind(this));
             }.bind(this);
         };

         // Send data to keystone service
         var req = http.request(options, result.callback);
         req.write(JSON.stringify(data));
         req.end();

         return result;
     },

     // /v3/users/<user_UUID>/projects
     keystoneGetTenants: function (user_uuid, token, next) {

         var config = this.getConfig();
         var http = require((config.protocol)?config.protocol:"http");

         var options = { host: config.host,
                         port: config.port,
                         method:'GET',
                         path: config.protocol + '://' + config.host  +
                         ':' + config.port +
                         '/v3/users/' + user_uuid + '/projects',
                         headers: {
                             "Content-Type": "application/json",
                             "X-Auth-Token":token,
                             "X-Service-Token":token
                         }
                       };

         //Accept Unauthorized Certs
         options.rejectUnauthorized = false;

         var result = new function () {
             this.callback = function (response) {
                 var chunk = '';
                 response.on('data', function(c){chunk += c;});
                 response.on('end', function() {
                     this.response = response;
                     try {
                         this.json = JSON.parse(chunk);
                     }catch(e){
                         this.json = {error:e};
                     }
                     next(); // callback passed
                 }.bind(this));
             }.bind(this);
         };

         // Send data to keystone service
         var req = http.request(options, result.callback);
         req.end();
         return result;
     },

     keystoneBuildAuth: function (username, password, config) {
         var method = (!config.method)?"password":config.method;
         var domain = (!config.domain)? {id:"default"} : config.domain;
         var data = {
             "auth": {
                 "identity": {
                     "methods": [method]
                 }
             }
         };
         if (method == "password") {
             data.auth.identity.password = {
                 "user": {
                     "name": username,
                     "password": password,
                     "domain": domain
                 }
             };
             if(config.user_id) {
                 data.auth.identity.password.user.id = config.user_id;
             }
         }

         if (method == "token") {
             data.auth.identity.token = {"id": config.token};
         }

         if (config.scope) {
             data.auth.scope = config.scope;
         }

         return data;
     },

     // REVOKE KEYSTONE TOKENS
     // Ex: An unscoped token must be revoked after it
     // is replaced for scoped one
     keystoneRevokeToken: function (token, newToken, next) {
         var config = this.getConfig();
         var http = require((config.protocol)?config.protocol:"http");

         var options = { host: config.host,
                         port: config.port,
                         method:'DELETE',
                         path: config.protocol + '://' + config.host  +
                         ':' + config.port +
                         '/v3/users',
                         headers: {
                             "X-Auth-Token": newToken,
                             "X-Subject-Token": token
                         }
                       };

         var result = new function () {
             this.callback = function (response) {
                 var chunk = '';
                 response.on('data', function(c){chunk += c;});
                 response.on('end', function() {
                     this.response = response;
                     try {
                         // TODO: his.json = JSON.parse(chunk);
                     }catch(e){
                         this.json = {error:e};
                     }
                     if(next instanceof Function)
                         next(); // callback passed
                 }.bind(this));
             }.bind(this);
         };

         // Send data to keystone service
         var req = http.request(options, result.callback);
         req.end();
         return result;
     },

     keystoneGetUsers: function (token,next) {
         var config = this.getConfig();
         var http = require((config.protocol)?config.protocol:"http");

         var options = { host: config.host,
                         port: config.port,
                         method:'GET',
                         path: config.protocol + '://' + config.host  +
                         ':' + config.port +
                         '/v3/users',
                         headers: {
                             "Content-Type": "application/json",
                             "X-Auth-Token":token,
                             "X-Service-Token":token
                         }
                       };

         //Accept Unauthorized Certs
         options.rejectUnauthorized = false;

         var result = new function () {
             this.callback = function (response) {
                 var chunk = '';
                 response.on('data', function(c){chunk += c;});
                 response.on('end', function() {
                     this.response = response;
                     try {
                         this.json = JSON.parse(chunk);
                     }catch(e){
                         this.json = {error:e};
                     }
                     next(); // callback passed
                 }.bind(this));
             }.bind(this);
         };

         // Send data to keystone service
         var req = http.request(options, result.callback);
         req.end();
         return result;
     },

     // Get token interceptor, use express sessions and
     // express request and response objects.
     // If tenant is provided, token will be scoped
     getToken: function (req, res, bundle, tenant, next) {
         var ref = this;
         var finalToken = null;
         // Since Authentication is done by keystone service
         // we have to create a Promise to handle that connection
         // before sending the http response
         new Promise(function (resolve, reject){
             //authenticate
             // username and pass are mandatory in bundle, scope is optional
             if (tenant) {
                 bundle.scope = {
                     project: {
                         id:tenant}
                 };
             }
             var oldToken = null;
             var result = ref.keystoneAuthenticate(
                 bundle,
                 function () {
                     if(result.json.error) {
                         reject(result.json);
                     } else {
                         req.session.authorized = true;
                         req.session.username = (bundle.username)?
                             bundle.username :
                             req.session.username;
                         req.session.token_scope = tenant;
                         finalToken = result.response
                             .headers['x-subject-token'];
                         oldToken = req.session.token;
                         req.session.token = finalToken;
                         req.session.user_uuid = result.json.token.user.id;
                         req.session.roles = result.json.token.roles;
                     }
                     resolve(finalToken);
                 });
         })
         // Promise of authentication is succesful
             .then(
                 function (token) {
                     if(next) {
                         if (next instanceof Function)
                             next(token);
                         else
                             next.success(token);
                     }
                     return finalToken;
                 })
         // Promise failed, user was not authenticated
             .catch(
                 function (resp) {
                     console.log("Failed to retrieve token");
                     console.log(resp);
                     if (next) {
                         if (next instanceof Function)
                             next();
                         else
                             next.fail(resp);
                     }
                     return finalToken;
                 });
     }
 };

module.exports = sessionHandler;
