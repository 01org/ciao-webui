var React = require('react');
var ReactDOM = require('react-dom');
var Catalogue = require('../components/catalogue/catalogue.js');
var InstancesHost = require('../components/instancesHost.js');
var GroupOverview = require('../components/groupOverview.js');
var UsageSummary = require('../components/usageSummary.js');
var AddInstances = require('../components/addInstances.js');
var navbar = require('../components/navbar.js');
var Logger = require('../util/logger.js');
var $ = require('jquery');

$('document').ready(function () {

    // Create Logger object
    window.logger = new Logger('logger-container');

    // create usage summary
    // How to use Usage Summary
    // first use a data source compatible for componenet.

    var getUnitString = function (value) {

        if (value == null)
            return function (arg) {return arg;};

        return value < 1500 ?
            value + "GB" :
            (value / 1000) + "TB";
    };

    var activeTenant = datamanager.data.activeTenant;

    // Component to Add instances
    datamanager.onDataSourceSet('add-instances', function (sourceData) {
        ReactDOM.render(
            <AddInstances sourceData={sourceData} logger={logger}/>,
            document.getElementById("add-instances"));
    });

    //Usage summary
    datamanager.onDataSourceSet('usage-summary', function (sourceData) {
        sourceData.source = "/quotas";
        var refresh = (datamanager.data.REFRESH | 3000);
        sourceData.refresh = Number(refresh);
        ReactDOM.render(
            <UsageSummary {...sourceData} logger={logger}/>,
            document.getElementById("usage-summary"));
    });
    // react hierarchy would be re-rendered
    datamanager.setDataSource('usage-summary', {data:[]});

    //create instances host
    var keyInstanceHost = 'instances-host';
    datamanager.onDataSourceSet(keyInstanceHost, function (sourceData) {
        sourceData.source = "/data/"
            + datamanager.data.activeTenant.id
            + "/servers/detail";
        // pagination shows 10 items per page
        // milliseconds
        var refresh = (datamanager.data.REFRESH | 3000);
        sourceData.refresh = Number(refresh);
        sourceData.recordsPerPage = 10;
        sourceData.dataKey = keyInstanceHost;
        if (datamanager.data.flavors) {
            try {
                if (datamanager.data.flavors[0].name)
                    sourceData.data = sourceData.data.map((x)=>{
                        try {
                            x.Image = datamanager.data.flavors.filter(
                                function (y) {
                                    return y.disk.localeCompare(x.Image) == 0 ;
                                })
                                .pop()
                                .name;}catch(e){}
                        return x;
                    });
            } catch(e){}
        }
        ReactDOM.render(
            <InstancesHost {...sourceData}/>,
            document.getElementById('instances-host'));
    });

    datamanager.setDataSource('instances-host',{data:[]});

    //create a volume
    var createVolume = function(data){
        console.log('data', data);

        $.post({url:
            '/data/' +
            datamanager.data.activeTenant.id
            + '/volumes',
                data: {
                    name: data.name,
                    size: data.size,
                    size: data.description
                }
            })
            .done(function (data) {
                console.log('done', data);
                //get data again?
                datamanager.setDataSource('block-catalogue',
                    {modal: null})
            });

    }
    // Block storage volume table
    var volumeComponent = 'block-catalogue';
    // Definition and functionality of buttons within volume component
    var volumeActions = [
        {
            label: 'Create',
            name: 'Create',
            onClick: function () {
                datamanager.setDataSource('block-catalogue', {
                    modal: {
                        title: 'Create a Volume',
                        type:'form',
                        fields: [
                            {
                                type:'text',
                                field:'input',
                                name:'name',
                                label:'Name'
                            },
                            {
                                type:'number',
                                field:'input',
                                name:'size',
                                label:'Size'
                            },
                            {
                                type:'text',
                                field:'textarea',
                                name:'description',
                                label:'Description'
                            }

                        ],
                        onAccept: createVolume,
                        acceptText: 'Create'
                    }
                })
            },
            onDisabled: function () {}
        },
        {
            label: 'Delete',
            name: 'Delete',
            onClick: function () {
                var vol_id = prompt('Enter volume id');
                $.ajax({
                    type:'DELETE',
                    url: '/data/' +
                        datamanager.data.activeTenant.id
                        + '/volumes/' +
                        vol_id
                       })
                    .done(function (data) {
                        console.log(data);
                    });
            },
            onDisabled: function () {}
        }
    ];
    // Volume component 'on mount' listener executes at 'componentDidMount'
    var volumeOnMountListener = function (callback){
        $.get('/data/' + datamanager.data.activeTenant.id
              + '/volumes/detail')
            .done(function (data) {
                callback();
                var fmtData = data.volumes.map((x) => {
                    return {
                        "volume_id":x.id,
                        "name":x.name,
                        "Size":new String(x.size," Gb"),
                        "Description":x.description,
                        "status":x.status,
                        "bootable":x.bootable
                    };
                });
                datamanager.setDataSource('block-catalogue', {
                    data: fmtData
                });
            }).fail(function (err) {
                callback();
                datamanager.setDataSource('block-catalogue', {
                    data: []
                });
            });

    };

    datamanager.onDataSourceSet(volumeComponent, function (sourceData) {
        var refresh = (datamanager.data.REFRESH | 3000);
        sourceData.refresh = Number(refresh);
        sourceData.recordsPerPage = 10;
        sourceData.id = 'volume_id';
        // Set URI to request volume resources
        sourceData.source = '/data/' + datamanager.data.activeTenant.id
            + '/volumes/detail';
        sourceData.onMount = volumeOnMountListener;
        sourceData.actions = volumeActions;
        ReactDOM.render(<Catalogue {...sourceData}/>,
                        document.getElementById('block-catalogue'));
    });
    setTimeout(() => datamanager.setDataSource('block-catalogue', {data:[]})
               ,1500);

    // Ends block storage volume table


    // create group overview
    datamanager.onDataSourceSet('group-overview', function (sourceData) {
        var refresh = (datamanager.data.REFRESH | 3000);
        sourceData.refresh = Number(refresh);
        ReactDOM.render(
                <GroupOverview {...sourceData} logger={logger}/>,
            document.getElementById("workloads-container"));
    });
    var getFlavors = function (attempts) {
        $.get({
            url:"/data/"+datamanager.data.activeTenant.id+"/flavors",
            timeout:5000})
            .done(function (data) {
                if (data) {
                    data.dataKey = 'group-overview';
                    data.detailUrl = '/data/' +
                        datamanager.data.activeTenant.id;
                    datamanager.setDataSource('group-overview', data);
                    datamanager.setDataSource('add-instances', {activeTenant, data});
                }
            }.bind(this))
            .fail(function (err) {
                if (attempts< 3)
                    getFlavors(attempts +1);
                else {
                    var data = {};
                    data.dataKey = 'group-overview';
                    data.detailUrl = '/data/' + datamanager.data.activeTenant.id;
                    datamanager.setDataSource('group-overview', data);
                }
            });
    };
    getFlavors(0);

    // Navigation bar
    var nprops = { logoutUrl: "/authenticate/logout"};
    // Data manager gets tenants which was passed through  routes:/tenant
    nprops.tenants = datamanager.data.tenants;
    nprops.activeTenant = activeTenant;

    nprops.username = document
        .getElementById("main-top-navbar")
        .getAttribute("attr-user");
    var n = React.createElement(navbar, nprops);
    ReactDOM.render(n, document.getElementById("main-top-navbar"));
});
