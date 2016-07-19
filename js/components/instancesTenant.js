// React js component
var React = require('react');
var CustomCatalogue = require('./catalogue/customCatalogue.js');

var instancesTenant = React.createClass({
    getDefaultProps: function() {
        // source defaults to server details url
        return {
            data: []
        };
    },
    startInstance: function(elements) {
        console.log('Starting instance: ', elements);
        //TODO: Change state in server. Changing locally just for testing
    },
    stopInstance: function(elements) {
        console.log('Stopping instance: ', elements);
        elements.forEach((el) => {
            var url = "/data/" +
                    el.tenant_id +
                    "/servers/" + el.instance_id + "/action";
            console.log(url);
            $.post({
                url: url,
                data: {server:el.instance_id, action:"os-stop"},
                dataType: "application/json"
            })
            .done((data) => {
                console.log(data);
            }).fail((err) => {
                console.log(err);
            });
        });
    },
    deleteInstance: function(elements) {
        console.log('deleting instance: ', elements);
    },
    confirmDelete: function(){
        this.refs.catalogue.showModal({
            title:'Remove Instance(s)',
            body:"You're about to remove an instance, this may result in "+
                    "a loss of data. Are you sure you want to remove?",
            onAccept:this.deleteInstance,
            acceptText:'Remove'
        });
    },
    disabledStartButton: function(item){
        var disabled = true;
        if(item.length > 0){
            var firstElement = item[0];
            if(firstElement.instance_state != 'active'
                && firstElement.instance_state != 'starting') {
                disabled = false;
            }
        }
        return disabled;
    },
    disabledStopButton: function(item){
        var disabled = true;
        if(item.length > 0){
            var firstElement = item[0];
            if(firstElement.instance_state != 'stopped') {
                disabled = false;
            }
        }
        return disabled;
    },
    disabledRemoveButton: function(item){
        var disabled = true;
        if(item.length > 0){
            disabled =  false;
        }
        return disabled;
    },
    getActions: function(){
        return [
            {
                label:'Start Sopped',
                name:'Start Sopped',
                onClick:this.startInstance,
                onDisabled:this.disabledStartButton
            },
            {
                label:'Stop Running',
                name:'Stop Running',
                onClick:this.stopInstance,
                onDisabled:this.disabledStopButton
            },
            {
                label:'Remove',
                name:'Remove',
                onClick:this.confirmDelete,
                onDisabled:this.disabledRemoveButton
            }
        ];
    },
    getDropdownActions: function(){
        return [
            {
                label:'All Running',
                name:'active',
                query:{'instance_state':'active'}
            },
            {
                label:'All Stopped',
                name:'stopped',
                query:{'instance_state':'stopped'}
            }
        ];
    },
    getSearchfields: function(){
        return  ['instance_label', 'instance_state', 'instance_tags'];
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    componentDidMount: function() {

        var callSource = function () {
            $.get({
                url:"/data/"+datamanager.data.activeTenant.id+this.props.source})
                .done(function (data) {
                    if (data) {
                        datamanager.setDataSource('instances-host',{
                            source: this.props.source,
                            data:data
                        });
                    }
                }.bind(this))
                .fail(function (err) {
                    datamanager.setDataSource('instances-host',{
                        source: this.props.source});
                }.bind(this));
        }.bind(this);
        callSource();

        window.setInterval(function () {
            callSource();
        }.bind(this),2000);
    },

    render: function() {

        var columns = [];
        if (this.props.data.length > 0) {
        columns = Object.keys(this.props.data[0]).map(function(text){
            return text.replace('_', ' ');
        });
        delete columns['id'];
        }


        return (
            <CustomCatalogue
                data={this.props.data}
                columns={columns}
                actions={this.getActions()}
                dropDownActions={this.getDropdownActions()}
                searchFields={this.getSearchfields()}
                ref="catalogue"
                searchTitle= "Search Nodes"
            />);
    }
});

module.exports = instancesTenant;
