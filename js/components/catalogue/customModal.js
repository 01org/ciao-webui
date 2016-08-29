// React js component
var React = require('react');
var reactBootstrap = require('react-bootstrap');
var Modal = reactBootstrap.Modal;
var Button = reactBootstrap.Button;
var Input = reactBootstrap.Input;
var Alert = reactBootstrap.Alert;
var data = [];

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
                required:true/false
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
            showAlert:false
        };
    },

    getDefaultProps: function() {
        return {
            acceptText:'Ok',
            cancelText:'Cancel',
            title:'Title of the modal',
            type: null,
            data:[]
        };
    },

    setValues: function (key, ev){
        data[key] = ev.target.value;
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
                                value={data[row.name]}
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
                                            id: row.id,
                                            className: 'form-control' ,
                                            label:label,
                                            value:data[row.name],
                                            onChange:this.setValues.bind(this, row.name)
                                        },
                                        ''
                                    )
                                )
                            );
                    break;
                case "select":
                    return <Input
                        id={row.id}
                        name={row.id}
                        type="select"
                        label={label}
                        placeholder={row.placeholder?row.placeholder:""}>
                            {row.options.map((opt, i) => {
                                return <option value={opt.value} key={i}>
                                    {opt.label}
                                </option>;})
                            }
                    </Input>;
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

    handleClose: function () {
        this.setState({showModal:false});
        this.props.onClose(data, this.state);
    },

    isValid: function () {
        var valid = true;
        if(this.props.type == 'form'){
            valid = !this.props.fields.find(function(item){
                if(item.validate.required){
                    return data[item.name] == '' ||
                        data[item.name] == undefined;
                }else{
                    return false;
                }
            });
        }

        return valid;
    },

    showAlert: function(alertText, stateAlert){

        this.setState({
            showAlert: {
                text: alertText,
                state:stateAlert
            }});
    },

    handleSubmit: function () {
        if(this.isValid()){
            this.setState({showModal:false});
            this.props.onAccept(data, this.state);
        }else{
            this.showAlert(
                'Please, fill out all required fields',
                'danger'
            );
        }
    },

    render: function() {
        data = [];

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
