// React js component
var React = require('react');
var CustomCatalogue = require('./catalogue/customCatalogue.js');
var $ = require('jquery');
var actionString = '';

var instancesHost = React.createClass({
    displayName: 'instancesHost',

    getInitialState: function () {
        return {
            pagination: 0, // offset is 0,
            items: 0,
            refresh: 3500,
            status: null, // selected status
            updating: false
        };
    },

    getDefaultProps: function () {
        // source defaults to server details url
        return {
            data: [],
            count : 0,
            recordsPerPage:10
        };
    },

    actionAllInstances: function (status) {
        var url = "/data/" + datamanager.data.activeTenant.id +
                "/servers/action";
        $.ajax({
            url: url,
            type: "POST",
            data: { status: 'all',
                    action: actionString
                  },
            dataType: "application/json"
        }).done(data => {
            console.log('data - action', data);
        }).fail(err => {
            console.log('err - action', err);
        });
    },

    startInstance: function (elements) {
        elements.forEach(el => {
            var url = "/data/" + datamanager.data.activeTenant.id +
                //TODO: not having tenant_id may cause bugs
                // for users with more than one tenant
                "/servers/" + el.id + "/action";
            $.post({
                url: url,
                data: { server: el.id, action: "os-start" },
                dataType: "application/json"
            }).done(data => {
                console.log(data);
            }).fail(err => {
                console.log(err);
            });
        });
    },

    stopInstance: function (elements) {
        elements.forEach(el => {
            var url = "/data/" + datamanager.data.activeTenant.id +
                //el.tenant_id +
                "/servers/" + el.id + "/action";
            $.post({
                url: url,
                data: { server: el.id, action: "os-stop" },
                dataType: "application/json"
            }).done(data => {
                console.log(data);
            }).fail(err => {
                console.log(err);
            });
        });
    },

    deleteInstance: function (elements) {
        elements.forEach(el => {
            var url = "/data/" + datamanager.data.activeTenant.id +
                //el.tenant_id +
                "/servers/" + el.id;
            $.ajax({
                url: url,
                type: "DELETE",
                data: { server: el.id, action: "os-delete" },
                dataType: "application/json"
            }).done(data => {
                console.log(data);
            }).fail(err => {
                console.log(err);
            });
        });
    },

    confirmDelete: function (status, actionString) {
        var modalTitle, modalBody, modalAceptText;
        switch (actionString) {
            case "os-start":
                modalTitle = "Start Instance(s)";
                modalBody = "You're about to start instances, this may take " +
                "a few minutes. Do you want to continue?";
                modalAceptText = "Start";
            break;
            case "os-stop":
                modalTitle = "Stop Instance(s)";
                modalBody = "You're about to stop instances, this may result " +
                "in a loss of data. Do you want to continue?";
                modalAceptText = "Stop";
            break;
            case "os-delete":
                modalTitle = "Remove Instance(s)";
                modalBody = "You're about to remove instances, this may result " +
                "in a loss of data. Do you want to continue?";
                modalAceptText = "Remove";
            break;
        }

        if (status !== "all") {
            this.refs.catalogue.showModal({
                title: 'Remove Instance(s)',
                body: "You're about to remove an instance, this may result in "
                + "a loss of data. Are you sure you want to remove?",
                onAccept: this.deleteInstance,
                acceptText: 'Remove'
            });
        } else {
            this.refs.catalogue.showModal({
                title: modalTitle,
                body: modalBody,
                onAccept: this.masiveAction,
                acceptText: modalAceptText
            });
        }
    },

    //If at least one is exites or stopped, enabled the button
    disabledStartButton: function (items) {
        var find = items.filter(function(item){
            return item.status == 'exited' || item.status == 'stopped';
        });

        return find.length == 0;
    },

    //If at least one is active, enabled the button
    disabledStopButton: function (items) {
        var find = items.filter(function(item){
            return item.status == 'active';
        });

        return find.length == 0;
    },

    disabledRemoveButton: function (items) {
        var enabled = false;
        if (items.length > 0) {
            enabled = true;
        }
        return !enabled;
    },

    getButtonsActions: function () {
        return [{
            label: 'Start',
            name: 'Start',
            onClick: this.startInstance,
            onDisabled: this.disabledStartButton
        }, {
            label: 'Stop',
            name: 'Stop',
            onClick: this.stopInstance,
            onDisabled: this.disabledStopButton
        }, {
            label: 'Remove',
            name: 'Remove',
            onClick: this.confirmDelete,
            onDisabled: this.disabledRemoveButton
        }];
    },

    getSelectActions: function () {
        return [
            {
                label:'All',
                name:'all',
                query: {'status':'all'}
            },{
                label: 'All Active',
                name: 'active',
                query: { 'status': 'active' }
            }, {
                label: 'All Stopped',
                name: 'stopped',
                query: { 'status': 'exited' }
            },{
                label:'None',
                name:'none',
                query: {'status':'none'}
            }];
    },

    getSearchfields: function () {
        return ['instance_label', 'instance_state', 'instance_tags'];
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        if(nextState.updating != this.state.updating)
            return false;
        return true;
    },

    componentDidMount: function () {
        var callSource = function () {
            if (this.state.updating == true)
                return;
            this.setState({updating: true});
            var query = '?limit=' + this.props.recordsPerPage;
            query = query +
                '&offset=' + (datamanager.data.offset ?
                              ((datamanager.data.offset -1)
                              * this.props.recordsPerPage):0);
            var url = this.props.source + query;

            $.get({url: url })
                .done(function (data) {
                    if (data) {

                        var url = this.props.source + '/count';
                        $.get({url: url })
                            .done(function (count) {
                                // if service returns complete data not
                                // not delimited by limit and offset querys
                                var fmtData = {
                                    dataKey: this.props.dataKey,
                                    source: this.props.source,
                                    data: data,
                                    count: count.count
                                };
                                this.setState({updating: false});
                                datamanager.setDataSource(this.props.dataKey,
                                                          fmtData);
                            }.bind(this));
                    }
                }.bind(this))
                .fail(function (err) {
                    this.setState({updating: false});
                    datamanager.setDataSource(this.props.dataKey, {
                        dataKey: this.props.dataKey,
                        source: this.props.source });
                }.bind(this));
        }.bind(this);
        callSource();

        window.setInterval(function () {
            callSource();
        }.bind(this), this.props.refresh);
    },

    onChangePage: function (lastRecord) {
        this.setState({ pagination: lastRecord });
    },

    render: function () {
        var columns = [];
        if (this.props.data.length > 0) {
            columns = Object.keys(this.props.data[0]).map(function (text) {
                return text.replace('_', ' ');
            });
        }
        if (this.props.data) return React.createElement(CustomCatalogue, {
            data: this.props.data,
            count: this.props.count,
            columns: columns,
            actions: this.getButtonsActions(),
            dropDownActions: this.getSelectActions(),
            searchFields: this.getSearchfields(),
            onChangePage: this.onChangePage,
            id: 'id',
            ref: 'catalogue',
            searchTitle: 'Search Instances'
        });else return React.createElement('div', null);
    }
});

module.exports = instancesHost;
