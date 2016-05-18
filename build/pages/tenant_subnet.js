var React = require('react');
var ReactDOM = require('react-dom');
var InstancesTenant = require('../components/instancesTenant.js');
var navbar = require('../components/navbar.js');
var $ = require('jquery');

$('document').ready(function () {

    var activeTenant = datamanager.data.activeTenant;

    //create instances host
    datamanager.onDataSourceSet('instances-tenant', function (sourceData) {
        sourceData.source = "/servers/detail";
        ReactDOM.render(React.createElement(InstancesTenant, sourceData), document.getElementById("instances-tenant"));
    });
    datamanager.setDataSource('instances-tenant', { data: [] });

    // Navigation bar
    var nprops = { logoutUrl: "/authenticate/logout" };
    // Data manager gets tenants which was passed through  routes:/tenant
    nprops.tenants = datamanager.data.tenants;
    nprops.activeTenant = activeTenant;
    nprops.back = {
        label: '< Back to [CNCI]',
        url: '/admin/network/' + datamanager.data.idNetwork
    };

    nprops.username = document.getElementById("main-top-navbar").getAttribute("attr-user");
    var n = React.createElement(navbar, nprops);
    ReactDOM.render(n, document.getElementById("main-top-navbar"));
});