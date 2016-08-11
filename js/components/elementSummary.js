// single summary element, plugs into usageSummary compoenent

var React = require('react');
var ReactDOM = require('react-dom');
var d3Element = require("../d3_components/d3ElementSummary.js");
var dom = require("react-faux-dom");
var reactBootstrap = require('react-bootstrap');
var Button = reactBootstrap.Button;

var elementSummary = React.createClass({

    getInitialState: function() {
        return {
            d3node: null
        };
    },

    getDefaultProps: function() {
        // put some default data
        var base = 148;
        return {
            width: base,
            height: base * 1.5,
            DonutChart: null
        };
    },

    componentWillUpdate: function(nextProps,nextState) {

    },
    shouldComponentUpdate: function(nextProps, nextState) {
        //return this.props !== nextProps;
        return true;
    },
    componentDidMount: function() {

        var callSource = function () {
            var n = dom.createElement('svg');
            n = d3Element.create(n, this.props, null);
            n = d3Element.update(n, this.props, null);
            this.setState({d3node:n});

        }.bind(this);
        callSource();

        window.setInterval(function () {
            callSource();
        }.bind(this),2000);
    },
    renderDonutChart: function(){
        if (this.state.d3node != null) {
            var DonutChart = this.state.d3node.toReact();
            return (
                <div>
                <div className="d3-container text-center">
                {DonutChart}
                </div>
                </div>
            );
        } else {
            return (<div>loading..</div>)
        }
    },
    renderPanel: function(){
        // define labels for each concept
        var reference;
        var body = this.props.value;
        var title = this.props.name;
        var secondaryBody = (title == 'Memory Usage' || title == 'Disk Usage')?' MB':'';
        var secondaryTitle = (title == 'Processor Load Average')?'':'';
        var buttonLabel = title.split(" ");

        // switching page jumps
        if (buttonLabel[0] === "Total") {
            if (this.props.history !== false) {
                reference = "#instances-overview";
            } else {
                reference = "/" + ((this.props.reference).substr(0,6)) + "#instances-overview";
            }
            buttonLabel = "Instances Overview";
        } else {
            if (this.props.history !== false) {
                reference = this.props.reference + "#" + buttonLabel[0];
            } else {
                reference = "#" + buttonLabel[0];
            }
            buttonLabel = buttonLabel[0] + " History";
        }

        // History Button
        var historyButton = <Button bsStyle={null}
                className="btn frm-btn-secondary"
                href={reference}>
                {buttonLabel}
            </Button>

        return (
            <div className="element-summary-panel">
                <div className="frm-panel-heading frm-panel-standar">
                </div>
                <div className="panel frm-panel frm-panel-default frm-panel-remake">
                    <div className="panel-body">
                        <h2 className="frm-secondary-text frm-bold-text">
                        {title}
                        </h2>
                        <h6 className="frm-bold-text frm-body-h6">
                            {body}{secondaryBody}
                        </h6>
                    </div>
                    <div className="panel-footer frm-panel-footer-secondary">
                        {historyButton}
                    </div>
                </div>
            </div>);
    },
    render: function() {
        if(this.props.quota){
            return this.renderDonutChart();
        }else{
            return this.renderPanel();
        }
    }

});

module.exports = elementSummary;
