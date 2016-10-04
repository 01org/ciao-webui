// React js component
var React = require('react');
var reactBootstrap = require('react-bootstrap');
var Modal = reactBootstrap.Modal;
var Button = reactBootstrap.Button;
var Input = reactBootstrap.Input;
var Alert = reactBootstrap.Alert;
var Select = require('react-select');

/* Custom modal usage
   Properties
    title:
    fields:
      type: parameter object Array
      field object definition:
         {
             id:"html id",
             label: "title or label",
             type:html types (text, number),
             options:[array of select values and labels {value"":,label:""}],
             validate:{
                required:true/false,
                regex:regex expression for complex fields
                message:error message to show if the regex expression dont pass
             }
         }
    onClose:
      type: function
    onAccept: function (parameters) {}
              callback function to be executed at 'handleSubmit' event.
              This function passes on parameters
    cancelText
    acceptText
    type: the type of modal to render, available types: 'form'
*/

var customModal = React.createClass({

    getInitialState: function () {
        return {
            showModal: true,
            showAlert:false,
            data:[]
        };
    },

    getDefaultProps: function() {
        return {
            acceptText:'Ok',
            cancelText:'Cancel',
            title:'Title of the modal',
            type: null
        };
    },

    onChange: function( key, event ) {
        var data = this.state.data;
        data[key] = event.target.value;
        this.setState({data: data});
    },

    getBody: function(){
        if(this.props.type == 'form'){
            return this.props.fields.map((row, i) => {

                var label = (row.validate.required)?row.label + '*':row.label;
                switch(row.field) {
                case "input":
                    return <Input
                                id={row.id}
                                label={label}
                                value={this.state.data[row.name]}
                                onChange={this.onChange.bind(this, row.name)}
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
                                          id: row.id,
                                          className: 'form-control' ,
                                          label:label,
                                          value:this.state.data[row.name],
                                          onChange: this.onChange.bind(this, row.name)
                                        },
                                        ''
                                    )
                                )
                            );
                    break;
                case "select":
                    return <Select
                            id={row.id}
                            label={label}
                            value={this.state.value}
                            placeholder='Select all'
                            options={row.options}
                            />;

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

    //Return true if the field is empty
    isEmpty: function(field){
        if (!field){
            return true;
        }else{
            if(field.trim() == ""){
                return true;
            }
        }
        return false;
    },

    //Return true if is wrong
    validateFieldWithRegex: function(regex, field){
        var reg = new RegExp(regex);
        if (!reg.test(field)) {
            return true;
        }

        return false;
    },

    isValid: function () {
        var valid = true;

        if(this.props.type == 'form') {

            valid = !this.props.fields.find(function (item) {
                if (item.validate) {
                    if(item.validate.required){
                        if(this.isEmpty(this.state.data[item.name])){
                            this.showAlert(
                                item.label + " field can't be empty",
                                'danger'
                            );
                            return true;
                        }else{
                            if(item.validate.regex){
                                var reg = new RegExp(item.validate.regex);
                                if (!reg.test(this.state.data[item.name])) {
                                    this.showAlert(
                                        item.validate.message,
                                        'danger'
                                    );
                                    return true;
                                } else {
                                    this.hideAlert();
                                }
                            }
                        }
                    }

                }
                return false;
            }.bind(this));
        }

        return valid;
    },

    showAlert: function(alertText, stateAlert){
        this.setState({
            showAlert: {
                text: alertText,
                state:stateAlert
            }
        });
    },

    hideAlert: function(){
        this.setState({
            showAlert: false
        });
    },

    handleClose: function () {
        this.setState({showModal:false, data: []});
        this.props.onClose(this.state.data, this.state);
    },

    handleSubmit: function () {
        if(this.isValid()){
            this.props.onAccept(this.state.data, this.state);
            this.setState({showModal:false, data: []});
        }
    },

    render: function() {

        var alert = function(){
            if(this.state.showAlert){
                return  (<Alert bsStyle={this.state.showAlert.state}>
                        {this.state.showAlert.text}
                    </Alert>);
            }
        }.bind(this);

        return  (
            <Modal show={this.state.showModal} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {alert()}
                    {this.getBody()}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.handleClose}>
                        {this.props.cancelText}
                    </Button>
                    <Button onClick={this.handleSubmit}>
                        {this.props.acceptText}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
});

module.exports = customModal;
