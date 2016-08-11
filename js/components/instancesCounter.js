// React js component
var React = require('react');
var reactBootstrap = require('react-bootstrap');
var Button = reactBootstrap.Button;

var instancesCounter = React.createClass({

    getDefaultProps: function() {
        // source defaults to server details url
        return {
            data: {}
        };
    },

    getInitialState: function() {
        return {updating: false};
    },

    componentDidMount: function() {
        var callSource = function () {
            if (this.state.updating == true)
                return;
            this.setState({updating: true});
            var url;
            var instancesQuota=0;
            url = "/data"+this.props.source;

            $.get({
                url:url})
                .done(function (data) {
                    if (data) {
                        data.nodes.map((node) => {
                            //console.log(node.total_instances);
                            instancesQuota+= node.total_instances;
                        });
                        data = {total_instances: instancesQuota};
                    }
                    this.setState({updating: false});
                    datamanager.setDataSource('instances-counter',{
                        source: this.props.source,
                        data:data
                    });
                }.bind(this))
                .fail(function (err) {
                    this.setState({updating: false});
                    datamanager.setDataSource('instances-counter',{
                        source: this.props.source});
            }.bind(this));
        }.bind(this);
        callSource();

        window.setInterval(function () {
            callSource();
        }.bind(this),2000);
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        //return this.props !== nextProps;
        if (nextState.updating != this.state.updating)
            return false;
        return true;
    },

    render: function() {
        console.log(this.props);
        console.log("total Instances",this.props.data.total_instances);

        return (
            <div className="element-summary-panel usageSummary">
            <div className="frm-panel-heading frm-panel-standar">
            </div>
                <div className="panel frm-panel-default">
                    <div className="panel-body">
                        <h3 className="frm-secondary-text frm-bold-text">
                           Total Instances
                        </h3>
                        <div>
                            <h6 className="frm-bold-text frm-body-h6">
                                {this.props.data.total_instances}
                            </h6>
                        </div>
                    </div>
                    <div className="panel-footer frm-panel-footer-secondary">
                        <Button bsStyle={null}
                            className="btn frm-btn-secondary"
                            href="admin/underConstruction">
                            Instance Overview
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
});


module.exports = instancesCounter;
