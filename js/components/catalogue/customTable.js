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
            activePage: 1
        };
    },
    selectRow: function (selectedRow) {
        var key = this.props.id;
        var newSelected = [];

        //first element
        if(this.props.selectedRows.length == 0){
            newSelected.push(selectedRow);
        }else{
            var indexRow = this.props.selectedRows.findIndex(function (row) {
                return row[key] == selectedRow[key];
            });

            this.props.selectedRows.forEach(function (element, index) {
                //If is the same, not add it.
                if (selectedRow[key] != element[key]) {
                    newSelected.push(element);
                }
            });

            //If not exist, add it.
            if(indexRow < 0) {
                newSelected.push(selectedRow);
            }
        }

        this.props.onSelectRow(newSelected);
    },

    isChecked: function (row) {
        return this.props.isChecked(row,this.props.selectedRows);
    },

    changePage: function (page) {
        this.setState({ activePage: page });
        datamanager.data.offset = page;
        //var lasItem = this.props.data[this.props.data.length - 1];
        this.props.onChangePage(page);
    },
    getTableHeader: function(){
        var table_header = this.props.columns.map((column, i) => {
                return React.createElement(
                    'th',
                    { key: i + 1 },
                    column
                );
        });
        table_header.unshift(React.createElement('td', { key: 0 }));

        return table_header;
    },
    getTableBody: function(){
        var table_body;

        try {
            table_body = this.props.data.map((row, i) => {
                    var columns = [];

            //Add input select for each row
            columns.push(React.createElement(
                'td',
                null,
                React.createElement('input', {
                    type: 'checkbox',
                    onClick: this.selectRow.bind(null, row),
                    checked: this.isChecked(row) })
            ));

            //Add the rest of the information into the body's table
            for (var key in row) {

                //Add link, if exist
                if(this.props.link && this.props.link.field == key){
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
                }else{
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
            table_body = [];
        }

        return table_body;
    },

    render: function () {

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
                        this.getTableHeader()
                    )
                ),
                React.createElement(
                    'tbody',
                    null,
                    this.getTableBody()
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
    }
});

module.exports = customTable;
