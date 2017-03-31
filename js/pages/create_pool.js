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

  //Get subnets

  $.get({url:"/data/cncis"})
    .done(function (data) {

      var subnets = [];

      data.cncis.forEach(function(cnci){
        if(cnci.subnets){
          cnci.subnets.forEach(function(subnet){
            subnets.push(subnet)
          })
        }
      })

      datamanager.setDataSource(keyForm, {
        subnets:subnets
      });

    });

  datamanager.onDataSourceSet(keyForm, function (sourceData) {
    //sourceData.source = "/data/" + activeTenant.id;

   // var refresh = (datamanager.data.REFRESH | 3000);

    //sourceData.refresh = Number(refresh);
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
