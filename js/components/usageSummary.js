// usage Summary display current instances,memory,vCPUs and disk vs quota
var React = require('react');
var ReactDOM = require('react-dom/server');
var ElementSummary = require('./elementSummary.js');

var usageSummary = React.createClass({

    getDefaultProps: function() {
        // source defaults to server details url
        return {
            data: {},
            refresh: 3500,
            logger: null
        };
    },

    getInitialState: function() {
        return {updating:false};
    },

    componentDidMount: function() {
        var callSource = function () {
            if (this.state.updating == true)
                return;
            this.setState({updating: true});
            var url;
            var instancesValue = 0, instancesQuota=0,
            memoryValue = 0, memoryQuota=0, procesorValue=0;
            var reference;

            if (!datamanager.data.activeTenant){
                // admin
                url = "/data"+this.props.source;
            } else {
                // tenant
                url = "/data/"+datamanager.data.activeTenant.id+this.props.source;
                reference = "tenant/usage";
            }
            $.get({
                url:url})
                .done(function (data) {
                    var fmtData;
                    if (data) {
                        // if there isn't an active tenant, look for nodes
                        if (!datamanager.data.activeTenant){
                            data.nodes.forEach((node) => {
                                instancesValue+= node.total_running_instances;
                                instancesQuota+= node.total_instances;
                                memoryValue+= node.ram_total-node.ram_available;
                                memoryQuota+=node.ram_total;
                                procesorValue+= node.online_cpus;
                            });
                            fmtData = [
                                {
                                    value: instancesValue,
                                    quota: instancesQuota,
                                    name: "Running Instances",
                                    unit: ""
                                },
                                {
                                    value: memoryValue,
                                    quota: memoryQuota,
                                    name: "Memory Usage",
                                    unit: ""
                                },
                                {
                                    value: procesorValue,
                                    name: "Online Processor",
                                    unit: ""
                                }
                            ];
                            this.setState({updating: false});
                            datamanager.setDataSource('usage-summary',{
                                source: this.props.source,
                                data:fmtData
                            });
                        } else {
                            this.setState({updating: false});
                            datamanager.setDataSource('usage-summary',{
                                source: this.props.source,
                                data:data
                            });
                        }
                    }
                }.bind(this))
                .fail(function (err) {
                    if (this.props.logger != null) {
                        this.props.logger.error(err.responseJSON.error.title,
                                                err.responseJSON.error.message);
                    }
                    this.setState({updating: false});
                    datamanager.setDataSource('usage-summary',{
                        source: this.props.source});
                }.bind(this));
        }.bind(this);
        callSource();

        window.setInterval(function () {
            callSource();
        }.bind(this), Number(this.props.refresh));
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        if(nextState.updating != this.state.updating)
            return false;
        return true;
    },

    render: function() {

        var dynamicWidth = Math.round(12 / this.props.data.length);
        var elements = [];
        var historyButton;
        var columnGrid, reference;

        if (this.props.data)  {
            if(this.props.data.length > 3) {
                // tenant
                columnGrid = "col-xs-3 col-sm-3";
                reference = "tenant/usage";
            } else {
                // admin
                columnGrid = "col-xs-4 col-sm-4";
                reference = "admin/underConstruction"
            }

            if(this.props.data.length !== undefined) {
                this.props.data.forEach(
                    (props) => {
                        elements.push(
                            <div key={props.name} className={columnGrid}>
                                <ElementSummary {...props} reference={reference}
                                history={this.props.history}/>
                            </div>
                        );
                    }
                );
            }
        }

        return (
            <div className="row">
                {elements}


            </div>
        );
    }

});

module.exports = usageSummary;
