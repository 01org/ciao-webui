var React = require('react');
var ReactDOM = require('react-dom');
var SubnetList = require('../components/subnetList.js');
var navbar = require('../components/navbar.js');
var $ = require('jquery');

$('document').ready(function () {

    var activeTenant = datamanager.data.activeTenant;

    datamanager.onDataSourceSet('subnet-list', function (sourceData) {
        sourceData.source = "/data/cncis/" + datamanager.data.idNetwork + "/detail";
        ReactDOM.render(React.createElement(SubnetList, sourceData), document.getElementById("subnet-list"));
    });
    datamanager.setDataSource('subnet-list', {});

    // Navigation bar
    var nprops = { logoutUrl: '/authenticate/logout' };
    // Data manager gets tenants which was passed through  routes:/tenant
    nprops.tenants = datamanager.data.tenants;
    nprops.activeTenant = activeTenant;
    nprops.back = {
        label: '< Back to [Admin Overview]',
        url: '/admin'
    };

    nprops.username = document.getElementById("main-top-navbar").getAttribute("attr-user");
    var n = React.createElement(navbar, nprops);
    ReactDOM.render(n, document.getElementById("main-top-navbar"));
});