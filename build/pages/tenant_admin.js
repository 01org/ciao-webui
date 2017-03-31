var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var ReactDOM = require('react-dom');
var Catalogue = require('../components/catalogue/catalogue.js');
var InstancesHost = require('../components/instancesHost.js');
var GroupOverview = require('../components/groupOverview.js');
var UsageSummary = require('../components/usageSummary.js');
var AddInstances = require('../components/addInstances.js');
var navbar = require('../components/navbar.js');
var Logger = require('../util/logger.js');
var CustomModal = require('../components/catalogue/customModal.js');
var $ = require('jquery');

$('document').ready(function () {

    // Create Logger object
    window.logger = new Logger('logger-container');

    // create usage summary
    // How to use Usage Summary
    // first use a data source compatible for componenet.

    var getUnitString = function (value) {

        if (value == null) return function (arg) {
            return arg;
        };

        return value < 1500 ? value + "GB" : value / 1000 + "TB";
    };

    var activeTenant = datamanager.data.activeTenant;

    // Component to Add instances
    datamanager.onDataSourceSet('add-instances', function (sourceData) {
        ReactDOM.render(React.createElement(AddInstances, { sourceData: sourceData }), document.getElementById("add-instances"));
    });

    //Usage summary
    datamanager.onDataSourceSet('usage-summary', function (sourceData) {
        sourceData.source = "/quotas";
        var refresh = datamanager.data.REFRESH | 3000;
        sourceData.refresh = Number(refresh);
        ReactDOM.render(React.createElement(UsageSummary, _extends({}, sourceData, { logger: logger })), document.getElementById("usage-summary"));
    });
    // react hierarchy would be re-rendered
    datamanager.setDataSource('usage-summary', { data: [] });

    //create instances host
    var keyInstanceHost = 'instances-host';
    datamanager.onDataSourceSet(keyInstanceHost, function (sourceData) {
        sourceData.source = "/data/" + datamanager.data.activeTenant.id + "/servers/detail";
        // pagination shows 10 items per page
        // milliseconds
        var refresh = datamanager.data.REFRESH | 3000;
        sourceData.refresh = Number(refresh);
        sourceData.recordsPerPage = 10;
        sourceData.dataKey = keyInstanceHost;
        if (datamanager.data.flavors) {
            try {
                if (datamanager.data.flavors[0].name) sourceData.data = sourceData.data.map(x => {
                    try {
                        x.Image = datamanager.data.flavors.filter(function (y) {
                            return y.disk.localeCompare(x.Image) == 0;
                        }).pop().name;
                    } catch (e) {}
                    return x;
                });
            } catch (e) {}
        }
        ReactDOM.render(React.createElement(InstancesHost, sourceData), document.getElementById('instances-host'));
    });

    datamanager.setDataSource('instances-host', { data: [] });

    // Starts Block storage volume table implementation
    // reference name for volume table container
    var volumeComponent = 'block-catalogue';
    //create a volume function: executed when user clicks on Create btn/action
    var createVolume = function (fields, containerNode) {
        // get data from modal supplied fields and build form request body
        var form = fields.reduce((prev, current) => {
            var val = prev;
            val[current.name] = document.getElementById(current.id).value;
            return val;
        }, {});
        // post form to API service
        $.post({ url: '/data/' + datamanager.data.activeTenant.id + '/volumes',
            data: form
        }).done(function (data) {
            // close modal
            document.getElementById(containerNode.id).remove();
        }).fail(err => {
            // close modal
            document.getElementById(containerNode.id).remove();
        });
    };

    // Modal create volume fields - use in 'Create' action
    // available fields: [name, size, description(optional)]
    var modalCreateFields = [{
        id: 'volume_id',
        type: 'text',
        field: 'input',
        name: 'name',
        label: 'Name',
        validate: {
            required: true
        }
    }, {
        id: 'volume_size',
        type: 'text',
        field: 'input',
        name: 'size',
        label: 'Size (GB)',
        validate: {
            required: true,
            regex: '^[1-9][0-9]*$',
            message: "Size must be a integer number greater than 0"
        }
    }, {
        id: 'volume_desc',
        type: 'textarea',
        field: 'textarea',
        name: 'description',
        label: 'Description',
        validate: {
            required: false
        }
    }];

    // Actions definition - add functionality to buttons within volume table
    var volumeActions = [{
        label: 'Create',
        name: 'Create',
        onClick: function (props, state) {
            var node = document.createElement("div");
            node.setAttribute('id', "temp-volume-create-modal");
            if (!document.getElementById(node.id)) document.body.appendChild(node);
            var modalParams = {
                title: 'Create a Volume',
                type: 'form',
                fields: modalCreateFields,
                onAccept: () => createVolume(modalCreateFields, node),
                onClose: function () {
                    document.getElementById(node.id).remove();
                },
                acceptText: 'Create'
            };
            ReactDOM.render(React.createElement(CustomModal, modalParams), document.getElementById('temp-volume-create-modal'));
        },
        onDisabled: function () {}
    }, {
        label: 'Delete',
        name: 'Delete',
        onClick: function (props, state) {
            var node = document.createElement("div");
            node.setAttribute('id', "temp-volume-modal");
            if (!document.getElementById("temp-volume-modal")) document.body.appendChild(node);
            //get volume list from datamanager available sources
            var volumeSource = datamanager.sources[volumeComponent].data;
            var volumeList = volumeSource ? volumeSource.map(i => {
                return { value: i.volume_id, label: i.name };
            }) : [];

            // TODO: check text format of options, could be more legible
            // Create modal params for deletion
            // if 1 or more volume is selected, just confirm
            // if no volumes are selected trigger modal to select 1 action
            var title, fields, type, onAccept;
            if (props.length > 0) {
                title = "Delete selected volumes?";
                type = null;
                fields = [];
                onAccept = function (params) {
                    props.forEach(volume => {
                        var vol_id = volume.volume_id;
                        $.ajax({
                            type: 'DELETE',
                            url: '/data/' + datamanager.data.activeTenant.id + '/volumes/' + vol_id
                        }).done(function (data) {
                            console.log(data);
                        });
                    });

                    document.getElementById(node.id).remove();
                };
            } else {
                title = "Delete Volume";
                type = "form";
                fields = [{
                    id: "delete_volume_id",
                    name: "volume_id",
                    label: "Select Volume",
                    field: "select",
                    options: volumeList,
                    validate: {
                        required: false
                    }
                }];
                onAccept = function (params) {
                    var vol_id = document.getElementById('delete_volume_id').value;
                    $.ajax({
                        type: 'DELETE',
                        url: '/data/' + datamanager.data.activeTenant.id + '/volumes/' + vol_id
                    }).done(function (data) {
                        console.log(data);
                    });
                    document.getElementById(node.id).remove();
                };
            }
            var modalParams = {
                title: "Delete Volume",
                //type: "form",
                fields: fields,
                body: "You're about to remove a volume, this may result in " + "a loss of data. Are you sure you want to remove?",
                onAccept: onAccept,
                onClose: () => document.getElementById(node.id).remove(),
                cancelText: "Cancel",
                acceptText: "Delete"
            };
            ReactDOM.render(React.createElement(CustomModal, modalParams), document.getElementById('temp-volume-modal'));
        },
        onDisabled: function () {}
    }, {
        label: 'Attach',
        name: 'Attach',
        onClick: function (props, state) {
            var node = document.createElement("div");
            node.setAttribute('id', "temp-volume-modal");
            if (!document.getElementById("temp-volume-modal")) document.body.appendChild(node);
            // Get instance list from datamanager available sources
            var instanceSource = datamanager.sources['instances-host'].data;
            var instanceList = instanceSource ? instanceSource.map(i => {
                return { value: i.id, label: i.id };
            }) : [];
            //get volume list from datamanager available sources
            var volumeSource = datamanager.sources[volumeComponent].data;
            var volumeList = volumeSource ? volumeSource.map(i => {
                return { value: i.volume_id, label: i.name };
            }) : [];
            // TODO: check text format of options, could be more legible
            var modalParams = {
                title: "Attach Instance",
                type: "form",
                fields: [{
                    id: "attach_volume_id",
                    name: "volume_id",
                    label: "Select Volume",
                    field: "select",
                    options: volumeList,
                    validate: {
                        required: false
                    }
                }, {
                    id: "attach_instance",
                    label: "Select Instance to attach volume",
                    field: "select",
                    options: instanceList,
                    validate: {
                        required: false
                    }
                }],
                onAccept: function (params) {

                    var vol_id = document.getElementById("attach_volume_id").value;
                    var server_id = document.getElementById("attach_instance").value;
                    var volumeAttachment = { "volumeAttachment": {
                            "volumeId": vol_id,
                            "device": null
                        } };
                    $.post({
                        url: '/data/' + datamanager.data.activeTenant.id + '/servers/' + server_id + '/os-volume_attachments',
                        data: { "json": JSON.stringify(volumeAttachment) }
                    }).done(data => console.log(data)).fail(data => console.log(data));
                    document.getElementById(node.id).remove();
                },
                onClose: () => document.getElementById(node.id).remove(),
                cancelText: "Cancel",
                acceptText: "Attach"
            };
            ReactDOM.render(React.createElement(CustomModal, modalParams), document.getElementById('temp-volume-modal'));
        },
        onDisabled: function () {}
    }, {
        label: 'Detach',
        name: 'Detach',
        onClick: function (props, state) {
            var node = document.createElement("div");
            node.setAttribute('id', "temp-volume-modal");
            if (!document.getElementById("temp-volume-modal")) document.body.appendChild(node);

            //get volume list from datamanager available sources
            var volumeSource = datamanager.sources[volumeComponent].data;
            var volumeList = [];
            if (volumeSource) {
                // COMPUTE API v2.1:only volumes with status 'in-use'
                // can be detached
                volumeList = volumeSource.filter(h => h.status === 'in-use').map(i => {
                    return { value: i.volume_id,
                        label: i.name };
                });
            }
            // TODO: check text format of options, could be more legible
            var modalParams = {
                title: "Attach Instance",
                type: "form",
                fields: [{
                    id: "detach_volume_id",
                    name: "volume_id",
                    label: "Select Volume",
                    field: "select",
                    options: volumeList,
                    validate: {
                        required: false
                    }
                }],
                onAccept: function (params) {

                    var vol_id = document.getElementById("detach_volume_id").value;
                    var volumeList = datamanager.sources[volumeComponent].rawData.volumes.filter(h => h.status === 'in-use');
                    // TODO: this detach system only works if volume
                    // is attached to a single instance. as it detaches only
                    // the first attachment. Look for better implementation
                    var server_id = volumeList.filter(i => vol_id === i.id)[0].attachments[0]['server_id'];
                    $.ajax({
                        type: 'DELETE',
                        url: '/data/' + datamanager.data.activeTenant.id + '/servers/' + server_id + '/os-volume_attachments' + '/' + vol_id
                    }).done(data => console.log(data)).fail(data => console.log(data));
                    document.getElementById(node.id).remove();
                },
                onClose: () => document.getElementById(node.id).remove(),
                cancelText: "Cancel",
                acceptText: "Detach volume"
            };
            ReactDOM.render(React.createElement(CustomModal, modalParams), document.getElementById('temp-volume-modal'));
        },
        onDisabled: function () {}
    }];

    // Volume component 'on mount' listener executes at 'componentDidMount'
    var volumeOnMountListener = function (callback) {
        $.get('/data/' + datamanager.data.activeTenant.id + '/volumes/detail').done(function (data) {
            callback();
            var fmtData = data.volumes.map(x => {
                var attachedTo = "None";
                if (x.attachments.length > 0) {
                    attachedTo = "";
                    x.attachments.forEach(a => {
                        attachedTo = a.server_id + " on " + a.device;
                    });
                }
                return {
                    "volume_id": x.id,
                    "status": x.status,
                    "name": x.name,
                    "Size": new String(x.size, " Gb"),
                    "Description": x.description,
                    "bootable": x.bootable,
                    "Attached to": attachedTo
                };
            });
            datamanager.setDataSource('block-catalogue', {
                data: fmtData,
                rawData: data
            });
        }).fail(function (err) {
            callback();
            datamanager.setDataSource('block-catalogue', {
                data: []
            });
        });
    };

    // Set volume component's event listener on datamanager
    datamanager.onDataSourceSet(volumeComponent, function (sourceData) {
        var refresh = datamanager.data.REFRESH | 3000;
        // set Select actions
        sourceData.selectActions = [{ label: 'Select all available', string: "select_available",
            query: { "status": "available" } }, { label: 'Select all attached', string: "select_attached",
            query: { "status": "in-use" } }, { label: 'Select all', string: "select_all",
            query: { "all": "all" } }, { label: 'Select none', string: "select_none",
            query: { "none": "none" } }];
        sourceData.refresh = Number(refresh);
        sourceData.recordsPerPage = 10;
        sourceData.id = 'volume_id';
        // Set URI to request volume resources
        sourceData.source = '/data/' + datamanager.data.activeTenant.id + '/volumes/detail';
        sourceData.onMount = volumeOnMountListener;
        sourceData.actions = volumeActions;
        ReactDOM.render(React.createElement(Catalogue, sourceData), document.getElementById('block-catalogue'));
    });
    datamanager.setDataSource('block-catalogue', { data: [] });

    // Ends block storage volume table

    // create group overview
    datamanager.onDataSourceSet('group-overview', function (sourceData) {
        var refresh = datamanager.data.REFRESH | 3000;
        sourceData.refresh = Number(refresh);
        ReactDOM.render(React.createElement(GroupOverview, _extends({}, sourceData, { logger: logger })), document.getElementById("workloads-container"));
    });
    var getFlavors = function (attempts) {
        $.get({
            url: "/data/" + datamanager.data.activeTenant.id + "/flavors",
            timeout: 5000 }).done(function (data) {
            if (data) {
                data.dataKey = 'group-overview';
                data.detailUrl = '/data/' + datamanager.data.activeTenant.id;
                datamanager.setDataSource('group-overview', data);
                datamanager.setDataSource('add-instances', { activeTenant, data });
            }
        }.bind(this)).fail(function (err) {
            if (attempts < 3) getFlavors(attempts + 1);else {
                var data = {};
                data.dataKey = 'group-overview';
                data.detailUrl = '/data/' + datamanager.data.activeTenant.id;
                datamanager.setDataSource('group-overview', data);
            }
        });
    };
    getFlavors(0);

    // Navigation bar
    var nprops = { logoutUrl: "/authenticate/logout" };
    // Data manager gets tenants which was passed through  routes:/tenant
    nprops.tenants = datamanager.data.tenants;
    nprops.activeTenant = activeTenant;

    nprops.username = document.getElementById("main-top-navbar").getAttribute("attr-user");
    var n = React.createElement(navbar, nprops);
    ReactDOM.render(n, document.getElementById("main-top-navbar"));
});