var React = require('react');
var ReactDOM = require('react-dom');
var UsageSummary = require('../components/usageSummary.js');
var navbar = require('../components/navbar.js');
var LineChartDetail = require('../components/lineChartDetail.js');

jQuery('document').ready(function () {

    var getUnitString = function (value) {

        if (value == null) return function (arg) {
            return arg;
        };

        return value < 1500 ? value + "GB" : value / 1000 + "TB";
    };
    // dummy data
    var usageSummaryData = {
        elements: [{
            value: 8,
            quota: 8,
            name: "Instances",
            unit: getUnitString(null)
        }, {
            value: 10,
            quota: 25,
            name: "Memory",
            unit: getUnitString
        }, {
            value: 12,
            quota: 20,
            name: "CPUs",
            unit: getUnitString(null)
        }, {
            value: 120,
            quota: 1700,
            name: "Disk",
            unit: getUnitString
        }, {
            value: 12,
            quota: 17,
            name: "CustomTag",
            unit: getUnitString(null)
        }]
    };

    datamanager.onDataSourceSet('usage-summary', function (sourceData) {
        ReactDOM.render(React.createElement(UsageSummary, sourceData), document.getElementById('usage-summary'));
    });

    //set data sources
    datamanager.setDataSource('usage-summary', usageSummaryData);

    //sample linechart render

    var d1 = new Date();

    var d2 = new Date();
    d2.setDate(d1.getDate() - 2);

    var d3 = new Date();
    d3.setDate(d1.getDate() - 4);

    var lcdata = {
        data: [{ id: 1, x: d1, y: 3 }, { id: 2, x: d2, y: 4 }, { id: 3, x: d3, y: 1 }],
        title: "Memory usage"
    };
    lcdata.data.forEach(d => console.log(d.x));

    datamanager.onDataSourceSet('line-chart1', function (sourceData) {
        ReactDOM.render(React.createElement(LineChartDetail, sourceData), document.getElementById("usage-details"));
    });
    datamanager.setDataSource('line-chart1', lcdata);

    var n = React.createElement(navbar, datamanager.data.navbar);
    ReactDOM.render(n, document.getElementById("main-top-navbar"));
});