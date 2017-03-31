var React = require('react');
var ReactDOM = require('react-dom');
var navbar = require('../components/navbar.js');
var Logger = require('../util/logger.js');
var $ = require('jquery');
var AddPool = require('../components/addPool.js');

$('document').ready(function () {

  // Create Logger object
  window.logger = new Logger('logger-container');

  //Set active tenant
  var activeTenant = datamanager.data.activeTenant;

  /* Start create IP Pool Form */
  var keyForm = 'create-ip-pool';

  datamanager.onDataSourceSet(keyForm, function (sourceData) {
    sourceData.dataKey = keyForm;

    ReactDOM.render(
    <AddPool {...sourceData}/>,
    document.getElementById('create-ip-pool'));
  });

  datamanager.setDataSource(keyForm,{data:[]});

  /* End create IP Pool Form */


  /* Start Navigation bar */

  var nprops = {
    logoutUrl: "/authenticate/logout",
    tenants: datamanager.data.tenants,
    activeTenant: activeTenant,
    back: {
      label:'< Back ',
      url: '/admin'
    },
    username: document.getElementById("main-top-navbar").getAttribute("attr-user")
  };

  var nav = React.createElement(navbar, nprops);
  ReactDOM.render(nav, document.getElementById("main-top-navbar"));

  /* End navigation bar */

});
