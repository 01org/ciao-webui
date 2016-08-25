
// React js component
var React = require('react');
var reactBootstrap = require('react-bootstrap');
var Modal = reactBootstrap.Modal;
var Button = reactBootstrap.Button;
var Input = reactBootstrap.Input;

var customModal = React.createClass({

    getDefaultProps: function() {
        return {
            acceptText:'Ok',
            cancelText:'Cancel',
            title:'Title of the modal',
            data:[]
        };
    },
    setValues: function (key, ev){
        this.props.data[key] = ev.target.value;
    },
    getBody: function(){
        if(this.props.type == 'form'){
            return this.props.fields.map((row, i) => {
                    switch(row.field) {
                        case "input":
                            return <Input
                                label={row.label}
                                value={this.props.data[row.name]}
                                onChange={this.setValues.bind(this, row.name)}
                                type={row.type} />;
                            break;
                        case "textarea":
                            return React.createElement(
                                'div',
                                null,
                                React.createElement(
                                    'div',
                                    { className: 'form-group' },
                                    <label class="control-label" >
                                        {row.label}
                                    </label>
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'form-group' },
                                    React.createElement(
                                        'textarea',
                                        {
                                            className: 'form-control' ,
                                            label:row.label,
                                            value:this.props.data[row.name],
                                            onChange:this.setValues.bind(this, row.name)
                                        },
                                        ''
                                    )
                                )
                            );
                            break;
                        default:
                            return React.createElement(
                                'p', {},'field not implemented'
                            );
                    }
                });
        }else{
            return React.createElement(
                'p', {},this.props.body
            );
        }
    },
    handleSumbmit: function(){
        this.props.onAccept(this.props.data);
    },
    render: function() {

        return  (
            <Modal show={true} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.getBody()}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onClose}>
                        {this.props.cancelText}
                    </Button>
                    <Button onClick={this.handleSumbmit}>
                        {this.props.acceptText}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
});

module.exports = customModal;
