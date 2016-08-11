// React js component
var React = require('react');
var reactBootstrap = require('react-bootstrap');
var Modal = reactBootstrap.Modal;
var Button = reactBootstrap.Button;
var Input = reactBootstrap.Input;
var $ = require('jquery');

var addInstances = React.createClass({

    getDefaultProps: function() {
        return {
            logger: null
        };
    },

    getInitialState: function () {
        return {
            showAddInstances: false,
            activeTenant: this.props.sourceData.activeTenant
        };
    },
    renderModal: function () {
        if (this.state.showAddInstances) {
            return <AddInstanceModal {...this.state.showAddInstances}/>
        }
    },
    hideModal: function () {
        this.setState({showAddInstances: false});
    },

    showModal: function (options) {
        this.setState({showAddInstances: options});
    },

    addInstances: function (data) {
        this.hideModal();
          datamanager.trigger('add-instances');

        var tenantId = datamanager.data.activeTenant.id;
        var body = {
            "name": data.instance_workload.name,
            "imageRef": data.instance_workload.id,
            "flavorRef": data.instance_workload.id,
            "min_count":data.number_instances,
            "max_count":data.number_instances
        };

        if (this.props.logger != null) {
            lReqInstances =this.props
                .logger.push("Add Instances",
                             "Request has been sent to server");
        }
        $.post({
            url:"/data/"+tenantId+"/servers",
            data:body
        })
        .done(function (success) {
            console.log('success', success);
            //datamanager.trigger('add-instances')
        })
        .fail(function (err) {
            console.log('err', err);
            if (this.props.logger != null) {
                this.props.logger.error(err.responseJSON.title,
                                        err.responseJSON.message);
            }
        });
    },

    confirmAddInstances: function (){
        var body = {
            activeTenant : this.state.activeTenant,
            flavors: this.props.sourceData.data.flavors
        };

        this.showModal({
            title:'Add Instances',
            body:body,
            onClose: this.hideModal,
            onAccept:this.addInstances,
            acceptText:'Launch'
        });
    },

    render: function () {
        return (<div className="pull-right">
                <h4>
                    <Button bsStyle={null} className="btn frm-btn-primary"
                        onClick={this.confirmAddInstances}>
                        Add Instances
                    </Button>
                 </h4>
                {this.renderModal()}
                </div>);
    },
    componentDidMount: function () {

        datamanager.addEvent('update-active-tenant', function (){
            this.setState({activeTenant: datamanager.data.activeTenant });
        }.bind(this));

    },
    componentWillUnmount: function () {
        // React removed me from the DOM, I have to unsubscribe from the pubsub using my token
        datamanager.clearEvent('update-active-tenant');
    },
});

var AddInstanceModal = React.createClass({
    getInitialState: function () {

        return {
            number_instances: 1,
            selectedWorkload: this.props.body.flavors[0],
            showModal: true,
            showMessage : false
        };
    },
    handleSubmit: function () {
        // Vanilla validation for number of instances input
        var validationState = inputNumericVal (this.state.number_instances);
        this.state.number_instances = validationState.value;
        if(validationState.state === true) {
            this.setState({ showMessage: false });
            this.onAccept();
        } else {
            this.setState({ showMessage: true });
        }
    },
    onAccept: function (){
        var selectedWorkload;
        this.props.body.flavors.forEach((v) => {
            if (v.id == this.state.selectedWorkload.id)
                selectedWorkload = v;
        });
        var data = {
            instance_workload: selectedWorkload,
            number_instances: this.state.number_instances
        };
        this.props.onAccept(data);
    },
    minus: function (){
        this.setState(
            {number_instances: this.state.number_instances - 1 }
        );
    },
    plus: function (){
        this.setState(
            {number_instances: this.state.number_instances + 1 }
        );
    },
    selectWorkload: function (ev){
        var selectedWorkload;
        this.props.body.flavors.forEach((v) => {
            if (v.id == ev.target.value)
                selectedWorkload = v;
        });
        this.setState({selectedWorkload: selectedWorkload });
    },
    setNumberOfInstances: function (ev){
        this.setState({number_instances: ev.target.value });
    },
    render: function () {

        var workloadOptions = this.props.body.flavors.map(function ( option, i){
                return <option value={option.id} key={i} >
                            {option.name}
                        </option>;
            }
        );

        var buttonMinus = <Button bsStyle={null} className="btn frm-btn-primary" onClick={this.minus} >-</Button>;
        var buttonPlus  = <Button bsStyle={null} className="btn frm-btn-primary" onClick={this.plus} >+</Button>;

        return (
            <Modal className="modal-container" show={this.state.showModal} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title className="modal-title">
                        {this.props.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row add-margin-bottom">
                        <div className="col-xs-6">
                            <div className="frm-secondary-text">
                                Tenant Name
                            </div>
                            <div className="frm-bold-text">
                                 {this.props.body.activeTenant.name}
                            </div>
                        </div>
                        <div className="col-xs-6">
                            <div className="frm-secondary-text">
                                Tenant ID
                            </div>
                            <div className="frm-bold-text">
                                {this.props.body.activeTenant.id}
                            </div>
                        </div>
                    </div>
                    <div className="row add-margin-bottom">
                        <div className="col-md-8 col-md-offset-2">
                            <Input
                                type="select"
                                label="Instance Workload"
                                onChange={this.selectWorkload}
                                placeholder="Instance Workload">
                                {workloadOptions}
                            </Input>

                            <Input label="Number of Instances"
                                value={this.state.number_instances}
                                onChange={this.setNumberOfInstances}
                                type="text" buttonBefore={buttonMinus}
                                buttonAfter={buttonPlus}/>
                            { this.state.showMessage ? <Message /> : null }
                       </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.handleSubmit}
                        bsStyle={null}
                        className="btn frm-btn-primary">
                        {this.props.acceptText}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
});

var Message = React.createClass({
    render: function () {
        return (
            <div id="Message"
                className="frm-alert-danger-icon">
                <span className="glyphicon glyphicon-alert">
                </span>
                <span className="frm-danger-message">
                    This value must be numeric and greater than 0
                </span>
            </div>
        );
    }
});

module.exports = addInstances;
