var React = require('react');
var ReactDOM = require('react-dom');
var navbar = require('../components/navbar.js');
var $ = require('jquery');

// Navigation bar
var nprops = { logoutUrl: "/authenticate/logout" };
// Data manager gets tenants which was passed through  routes:/tenant
nprops.back = {
    label: '< Back to [Tenant]',
    url: '/tenant'
};

nprops.username = document.getElementById("main-top-navbar").getAttribute("attr-user");

console.log('nprops', nprops);
var n = React.createElement(navbar, nprops);
ReactDOM.render(n, document.getElementById("main-top-navbar"));