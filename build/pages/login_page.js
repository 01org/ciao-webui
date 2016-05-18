var React = require('react');
var ReactDOM = require('react-dom');
var loginComponent = require('../components/login');
var navbar = require('../components/navbar.js');

var n = React.createElement(navbar, {});
ReactDOM.render(n, document.getElementById("main-top-navbar"));

var l = React.createElement(loginComponent);
ReactDOM.render(l, document.getElementById("login-container"));