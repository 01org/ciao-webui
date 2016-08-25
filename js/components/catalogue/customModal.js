// React js component
var React = require('react');
var reactBootstrap = require('react-bootstrap');
var Modal = reactBootstrap.Modal;
var Button = reactBootstrap.Button;
var Input = reactBootstrap.Input;

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
             options:[array of select values and labels {value"":,label:""}]
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
            showModal: true
        };
    },

    getDefaultProps: function() {
        return {
            acceptText:'Ok',
            cancelText:'Cancel',
            title:'Title of the modal',
            type: 'form',
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
                                id={row.id}
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
                                            id: row.id,
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
                case "select":
                    return <Input
                        id={row.id}
                        name={row.id}
                        type="select"
                        label={row.label}
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
        this.props.onClose();
    },

    handleSubmit: function () {
        this.setState({showModal:false});
        this.props.onAccept(this.props.data);
    },

    render: function() {
        return  (
            <Modal show={this.state.showModal} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
