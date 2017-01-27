var express = require('express');
var router = express.Router();
var sessionHandler = require('../core/session');

//config object is passed on to ejs view
var config = {
    title: 'CIAO',
    page: 'pages/tenant.ejs',
    scripts: [
        '/javascripts/bundle_tenant_detail.js',
        '/util/chosen.jquery.js'
    ],
    data: {
        title: 'CIAO',
        //section: 'Tenant Overview',
        username: "no_user"
    }
};

function validatePermissions (req, res, next){
    if(req.session.isAdmin){ //if is admin, redirect to /admin
        res.redirect('/admin');
    }

    next();
};

var getTenants = function (req, res, next) {
    if (!req.session.tenants) {
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
            req.session.tenants = [];
            req.session.activeTenant = getActiveTenant();
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

router.get('/', validatePermissions, function(req, res, next) {
    //render default template, with tenant page path
    config.data.username = req.session.username;
    config.data.tenants = req.session.tenants;
    config.data.activeTenant = req.session.activeTenant;
    config.data.section = req.session.activeTenant.name + " overview";
    config.data.REFRESH = (Number(process.env.REFRESH) | 3500);
    config.data.reference = "tenant/usage";

    res.render(process.env.NODE_ENV+'_template', config);
});

router.get('/list', validatePermissions, function (req, res, next) {
    var tenants = req.session.tenants;
    res.send(tenants ? tenants:[]);
});

// Retrieves usage details for the default tenant
var usageConfig = {
    title: 'Tenant detailed view',
    page: 'pages/tenant_usage.ejs',
    scripts: [
        '/javascripts/bundle_tenant_usage_detail.js',
        '/util/chosen.jquery.js'
    ],
    data: {
        title: 'CIAO',
        section: 'Usage Overview'
    }
};
router.get('/usage', validatePermissions, function (req, res, next) {

    usageConfig.data.username = req.session.username;
    usageConfig.data.tenants = req.session.tenants;
    usageConfig.data.activeTenant = req.session.activeTenant;
    usageConfig.data.label = '< Back to [Overview]'
    usageConfig.data.navbar = {
        username: req.session.username,
        tenants: req.session.tenants,
        logoutUrl: "/authenticate/logout"
    };
    usageConfig.data.reference = "tenant/usage";
    res.render(process.env.NODE_ENV+'_template', usageConfig);
});

var groupConfig = {
    title: 'Tenant detailed group view',
    page: 'pages/tenant_group.ejs',
    scripts: [
        '/javascripts/bundle_tenant_group.js',
        '/util/chosen.jquery.js'
    ],
    data: {
        title: 'CIAO',
        section: 'Group Overview'
    }
};

router.get('/group/:id', validatePermissions, function (req, res, next) {

    groupConfig.data.username = req.session.username;
    groupConfig.data.tenants = req.session.tenants;
    groupConfig.data.activeTenant = req.session.activeTenant;
    groupConfig.data.groupId =  req.params.id;
    groupConfig.data.navbar = {
        username: req.session.username,
        tenants: req.session.tenants,
        logoutUrl: "/authenticate/logout"
    };
    res.render(process.env.NODE_ENV+'_template', groupConfig);
});

// Retrieves a Under construction view
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

// Retrieves main view according selected tenant
var tenantDetail = {
    title: 'Tenant Detail',
    page: 'pages/tenant_detail.ejs',
    scripts: [
        '/javascripts/bundle_tenant_detail.js',
        '/util/chosen.jquery.js'
    ],
    data: {
        title: 'CIAO',
        section: ''
    }
};

router.get('/:name', function (req, res, next) {

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
    tenantDetail.data.reference = "tenant/"+req.params.name+"/usage";
    res.render(process.env.NODE_ENV+'_template', tenantDetail);
});

// Retrieves usage details according selected tenant
router.get('/:name/usage', function (req, res, next) {

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
    usageConfig.data.reference = "tenant/"+req.params.name+"/usage";
    res.render(process.env.NODE_ENV+'_template', usageConfig);
});


module.exports = router;
