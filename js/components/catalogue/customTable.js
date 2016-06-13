var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// React js component
var React = require('react');
var reactBootstrap = require('react-bootstrap');
var Table = reactBootstrap.Table;
var CustomPagination = require('./customPagination.js');

var customTable = React.createClass({
    displayName: 'customTable',

    getInitialState: function () {
        return {
            activePage: 1,
            actualItems: []
        };
    },

    select: function (row) {
        var selected = this.props.selectedRows;
        var newSelected = [];

        if (Object.keys(selected).length == 1) {

            if (selected[0][this.props.id] == row[this.props.id]) {
                newSelected = [];
            } else {
                newSelected.push(row);
            }
        } else {
            newSelected.push(row);
        }
        this.props.onSelectRow(newSelected);
    },

    isChecked: function (row) {
        // isChecked function comes customCatalogue component
        return this.props.isChecked(row,this.props.selectedRows);
    },

    changePage: function (page) {
        this.setState({ activePage: page });
        datamanager.data.offset = page;
        //var lasItem = this.props.data[this.props.data.length - 1];
        this.props.onChangePage(page);
    },

    render: function () {

        var actualData = this.props.data;

        var body;
        try {
            body = actualData.map((row, i) => {
                    var columns = [];

            columns.push(React.createElement(
                'td',
                null,
                React.createElement('input', {
                    type: 'checkbox',
                    onClick: this.select.bind(null, row),
                    checked: this.isChecked(row) })
            ));

            //first element is a link
            if (this.props.link) {

                columns.push(React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'a',
                        { className: 'frm-link',
                            href: this.props.link.url +
                            row[this.props.link.field] },
                        row[this.props.link.field]
                    )
                ));

            }

            for (var key in row) {

                if(key != this.props.link.field){
                    columns.push(React.createElement(
                        'td',
                        { key: key, className: key + '-' + row[key] },
                        row[key]
                    ));
                }
            }

            return React.createElement(
                'tr',
                { className: this.isChecked(row) ? 'active ' : '',
                    key: i },
                columns
            );
        });
        } catch(err) {
            body = [];
        }

        var header = this.props.columns.map((column, i) => {
                return React.createElement(
                    'th',
                    { key: i + 1 },
                    column
                );
    });
        header.unshift(React.createElement('td', { key: 0 }));

        return React.createElement(
            'div',
            { className: 'table-responsive' },
            React.createElement(
                Table,
                { className: 'table-hover' },
                React.createElement(
                    'thead',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        header
                    )
                ),
                React.createElement(
                    'tbody',
                    null,
                    body
                )
            ),
            React.createElement(
                'div',
                { className: 'frm-pagination' },
                React.createElement(
                    CustomPagination,
                    _extends({
                        className: 'pagination',
                        items: this.props.pagination.items,
                        itemsPerPage: this.props.pagination.limit
                    }, this.props.pagination, {
                        onSelect: this.changePage }))
            )
        );
    },
    componentWillUnmount: function () {},
    componentDidMount: function () {
        // $.get(this.props.source,
        //       (result) => {
        //           this.props.data = (result.length == 0)?
        //               result:this.props.fake_data;
        //           // TODO: render
        //       });
    },
    componentDidUpdate: function (prevProps, prevState) {}
});

module.exports = customTable;
