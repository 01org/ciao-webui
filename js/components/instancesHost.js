// React js component
var React = require('react');
var CustomCatalogue = require('./catalogue/customCatalogue.js');
var $ = require('jquery');

var instancesHost = React.createClass({
    displayName: 'instancesHost',

    getInitialState: function () {
        return {
            pagination: 0, // offset is 0,
            items: 0
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

    startInstance: function (elements) {
        console.log('Starting instance: ', elements);
        elements.forEach(el => {
            var url = "/data/" + datamanager.data.activeTenant.id +
                //TODO: not having tenant_id may cause bugs
                // for users with more than one tenant
                "/servers/" + el.instance_id + "/action";
        $.post({
            url: url,
            data: { server: el.instance_id, action: "os-start" },
            dataType: "application/json"
        }).done(data => {
            console.log(data);
    }).fail(err => {
            console.log(err);
    });
    });
    },
    stopInstance: function (elements) {
        console.log('Stopping instance: ', elements);
        elements.forEach(el => {
            var url = "/data/" + datamanager.data.activeTenant.id +
                    //el.tenant_id +
                "/servers/" + el.instance_id + "/action";
        $.post({
            url: url,
            data: { server: el.instance_id, action: "os-stop" },
            dataType: "application/json"
        }).done(data => {
            console.log(data);
    }).fail(err => {
            console.log(err);
    });
    });
    },
    deleteInstance: function (elements) {
        console.log('deleting instance: ', elements);
        elements.forEach(el => {
            var url = "/data/" + datamanager.data.activeTenant.id +
                    //el.tenant_id +
                "/servers/" + el.instance_id;
        console.log(url);
        $.ajax({
            url: url,
            type: "DELETE",
            data: { server: el.instance_id, action: "os-delete" },
            dataType: "application/json"
        }).done(data => {
            console.log(data);
    }).fail(err => {
            console.log(err);
    });
    });
    },
    confirmDelete: function () {
        this.refs.catalogue.showModal({
            title: 'Remove Instance(s)',
            body: "You're about to remove an instance, this may result in " + "a loss of data. Are you sure you want to remove?",
            onAccept: this.deleteInstance,
            acceptText: 'Remove'
        });
    },
    disabledStartButton: function (item) {
        var disabled = true;
        if (item.length > 0) {
            var firstElement = item[0];
            if (firstElement.State != 'running' && firstElement.State != 'starting') {
                disabled = false;
            }
        }
        return disabled;
    },
    disabledStopButton: function (item) {
        var disabled = true;
        if (item.length > 0) {
            var firstElement = item[0];
            if (firstElement.State != 'stopped' && firstElement.State != 'exited') {
                disabled = false;
            }
        }
        return disabled;
    },
    disabledRemoveButton: function (item) {
        var disabled = true;
        if (item.length > 0) {
            disabled = false;
        }
        return disabled;
    },
    getActions: function () {
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
    getDropdownActions: function () {
        return [{
            label: 'All Running',
            name: 'running',
            query: { 'State': 'running' }
        }, {
            label: 'All Stopped',
            name: 'stopped',
            query: { 'State': 'exited' }
        }];
    },
    getSearchfields: function () {
        return ['instance_label', 'instance_state', 'instance_tags'];
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    componentDidMount: function () {
        var executing = false;
        var callSource = function () {
            if (executing == true)
                return;
            else
                executing = true;
            var query = '?limit=' + this.props.recordsPerPage;

            query = query +
                '&offset=' + (datamanager.data.offset ?
                              datamanager.data.offset - 1:0);

            console.log('query', query);
            var url = this.props.source + query;

            $.get({url: url })
                .done(function (data) {
                    if (data) {

                        var url = this.props.source + '/count';
                        $.get({url: url })
                            .done(function (count) {
                                executing = false;
                                // if service returns complete data not
                                // not delimited by limit and offset querys
                                var fmtData = {
                                    dataKey: this.props.dataKey,
                                    source: this.props.source,
                                    data: data,
                                    count: count.count
                                };
                                //if (data.length > this.props.recordsPerPage) {
                                //    fmtData.count = count.count;
                                //} else {
                                //    fmtData.count = 0;
                                //}
                                datamanager.setDataSource(this.props.dataKey,
                                                          fmtData);
                            }.bind(this));
                    }
                }.bind(this))
                .fail(function (err) {
                    datamanager.setDataSource(this.props.dataKey, {
                        dataKey: this.props.dataKey,
                        source: this.props.source });
                }.bind(this));
        }.bind(this);
        callSource();

        window.setInterval(function () {
            callSource();
        }.bind(this), 3500);
    },

    onChangePage: function (lastRecord) {

        this.setState({ pagination: lastRecord });
        //onStateChange
        //componentShouldUpdate
    },
    componentWillMount: function () {

        console.log('componentWillMount', this);
        //onStateChange
        //componentShouldUpdate
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
            actions: this.getActions(),
            dropDownActions: this.getDropdownActions(),
            searchFields: this.getSearchfields(),
            onChangePage: this.onChangePage,
            ref: 'catalogue'
        });else return React.createElement('div', null);
    }
});

module.exports = instancesHost;
