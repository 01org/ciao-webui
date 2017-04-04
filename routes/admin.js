var express = require('express');
var router = express.Router();
var sessionHandler = require('../core/session');

//config object is passed on to ejs view
var config = {
    title: 'Admin Overview',
    page: 'pages/admin.ejs',
    scripts: [
        '/javascripts/bundle_admin.js'
    ],
    data: {
        title: 'Admin Overview',
        section: 'Admin',
        username: "no_user"
    }
};

function validatePermissions (req, res, next){
    if(!req.session.isAdmin){ //if is admin, redirect to /admin
      res.redirect('/forbidden');
    }

    next();
};

var getTenants = function (req, res, next) {

    if (!req.session.tenants) {
        req.session.tenants = [];
        req.session.activeTenant = [];
        //tenants are not set for this user's session
        var result;
        new Promise(function (resolve, reject) {
            result = sessionHandler.keystoneGetTenants(
                req.session.user_uuid,
                req.session.token,
                function () {
                    resolve();
                });
        }).then(function () {
            req.session.tenants = result.json.projects;
            req.session.activeTenant = result.json.projects ?
                result.json.projects[0]:[];
            if (process.env.NODE_ENV != 'production') {
                console.log("Succesfully retrieved tenants:");
                console.log(req.session.tenants);
            }
            next();
        }).catch(function () {
            if (process.env.NODE_ENV != 'production') {
                console.log("ERROR: didn't retrieved tenants");
            }
            next();
        });
    } else {
        next();
    }
};

router.use(sessionHandler.validateSession);
router.use(getTenants);

/* GET users listing. */
router.get('/', validatePermissions, function(req, res, next) {
    //render default template, with tenant page path
    config.data.username = req.session.username;
    config.data.tenants = req.session.tenants;
    config.data.navbar = {
        username: req.session.username,
        tenants: req.session.tenants,
        logoutUrl: "/authenticate/logout"
    };
    res.render(process.env.NODE_ENV+'_template', config);
});


var machineConfig = {
    title: 'UUID',
    page: 'pages/machine.ejs',
    scripts: [
        '/javascripts/bundle_tenant_machine.js'
    ],
    data: {
        title: 'CIAO',
        section: 'NODE',
        username: "no_user"
    }
};

router.get('/machine/:id', function (req, res, next) {

    machineConfig.data.username = req.session.username;
    machineConfig.data.tenants = req.session.tenants;
    machineConfig.data.activeTenant = req.session.activeTenant;
    machineConfig.data.idMachine =  req.params.id;
    machineConfig.data.navbar = {
        username: req.session.username,
        tenants: req.session.tenants,
        logoutUrl: "/authenticate/logout"
    };
    res.render(process.env.NODE_ENV+'_template', machineConfig);
});


var networkConfig = {
    title: 'CNCI',
    page: 'pages/tenant_network.ejs',
    scripts: [
        '/javascripts/bundle_tenant_network.js'
    ],
    data: {
        title: 'CIAO',
        section: 'CNCI'
    }
};

router.get('/network/:id', function (req, res, next) {

    networkConfig.data.username = req.session.username;
    networkConfig.data.tenants = req.session.tenants;
    networkConfig.data.activeTenant = req.session.activeTenant;
    networkConfig.data.idNetwork =  req.params.id;
    networkConfig.data.navbar = {
        username: req.session.username,
        tenants: req.session.tenants,
        logoutUrl: "/authenticate/logout"
    };
    res.render(process.env.NODE_ENV+'_template', networkConfig);
});



var subnetConfig = {
    title: 'Subnet',
    page: 'pages/tenant_subnet.ejs',
    scripts: [
        '/javascripts/bundle_tenant_subnet.js'
    ],
    data: {
        title: 'CIAO',
        section: 'Subnet'
    }
};

router.get('/network/:idNetwork/subnet/:idSubnet', function (req, res, next) {

    subnetConfig.data.username = req.session.username;
    subnetConfig.data.tenants = req.session.tenants;
    subnetConfig.data.activeTenant = req.session.activeTenant;
    subnetConfig.data.idSubnet =  req.params.idSubnet;
    subnetConfig.data.idNetwork =  req.params.idNetwork;
    subnetConfig.data.navbar = {
        username: req.session.username,
        tenants: req.session.tenants,
        logoutUrl: "/authenticate/logout"
    };
    res.render(process.env.NODE_ENV+'_template', subnetConfig);
});

var underConstruction = {
    title: 'Coming Soon',
    page: 'pages/under_construction.ejs',
    scripts: [
        '/javascripts/bundle_under_construction.js'
    ],
    data: {
        title: 'CIAO',
        section: 'Coming Soon'
    }
};

router.get('/underConstruction', function (req, res, next) {

    underConstruction.data.username = req.session.username;
    underConstruction.data.tenants = req.session.tenants;
    underConstruction.data.activeTenant = req.session.activeTenant;
    underConstruction.data.idSubnet =  req.params.idSubnet;
    underConstruction.data.idNetwork =  req.params.idNetwork;
    underConstruction.data.navbar = {
        username: req.session.username,
        tenants: req.session.tenants,
        logoutUrl: "/authenticate/logout"
    };
    res.render(process.env.NODE_ENV+'_template', underConstruction);
});

// Retrieves the main view detail according the selected tenant
var tenantDetail = {
    title: 'Tenant Detail',
    page: 'pages/tenant_detail.ejs',
    scripts: [
        '/javascripts/bundle_tenant_detail.js'
    ],
    data: {
        title: 'CIAO',
        section: ''
    }
};

router.get('/tenantDetail/:name', function (req, res, next) {

    function findTenant(tenant) {
        return tenant.name === req.params.name;
    }

    var activeTenant;
    // take a look on this and replace for a better code
    if (req.params.name === 'admin') {
        activeTenant = req.session.activeTenant;

    } else {
        activeTenant = req.session.tenants.find(findTenant);
    }

    tenantDetail.data.section = req.params.name + " overview";
    tenantDetail.data.username = req.session.username;
    tenantDetail.data.tenants = req.session.tenants;
    tenantDetail.data.activeTenant = activeTenant;
    tenantDetail.data.navbar = {
        username: req.session.username,
        tenants: req.session.tenants,
        logoutUrl: "/authenticate/logout"
    };
    tenantDetail.data.reference = "admin/tenantDetail/"+req.params.name+"/usage";
    res.render(process.env.NODE_ENV+'_template', tenantDetail);
});

// Retrieves usage details for the default tenant
var usageConfig = {
    title: 'Tenant detailed view',
    page: 'pages/tenant_usage.ejs',
    scripts: [
        '/javascripts/bundle_tenant_usage_detail.js'
    ],
    data: {
        title: 'CIAO',
        section: 'Usage Overview'
    }
};

router.get('/tenantDetail/:name/usage', function (req, res, next) {

    function findTenant(tenant) {
        return tenant.name === req.params.name;
    }

    var activeTenant;
    // take a look on this and replace for a better code
    if (req.params.name === 'admin') {
        activeTenant = req.session.activeTenant;

    } else {
        activeTenant = req.session.tenants.find(findTenant);
    }

    usageConfig.data.section = req.params.name + " overview";
    usageConfig.data.username = req.session.username;
    usageConfig.data.tenants = req.session.tenants;
    usageConfig.data.activeTenant = activeTenant;
    usageConfig.data.navbar = {
        username: req.session.username,
        tenants: req.session.tenants,
        logoutUrl: "/authenticate/logout"
    };
    usageConfig.data.reference = "admin/tenantDetail/"+req.params.name+"/usage";
    res.render(process.env.NODE_ENV+'_template', usageConfig);
});


var createPoolConfig = {
    title: 'Create New IP Pool',
    page: 'pages/create_pool.ejs',
    scripts: [
        '/javascripts/bundle_create_pool.js'
    ],
    data: {
        title: 'Create New IP Pool',
        section: 'IP Pool'
    }
};

router.get('/create/pool', function (req, res, next) {

    createPoolConfig.data.username = req.session.username;
    createPoolConfig.data.tenants = req.session.tenants;
    createPoolConfig.data.activeTenant = req.session.activeTenant;
    createPoolConfig.data.idNetwork =  req.params.id;
    createPoolConfig.data.navbar = {
        username: req.session.username,
        tenants: req.session.tenants,
        logoutUrl: "/authenticate/logout"
    };
    res.render(process.env.NODE_ENV+'_template', createPoolConfig);
});


module.exports = router;
