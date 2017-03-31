// React js component
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;


var Grid = ReactBootstrap.Grid,
    Row = ReactBootstrap.Row,
    Col = ReactBootstrap.Col;


var Catalogue = require('../components/catalogue/catalogue.js');
var Table = require('../components/catalogue/customTable.js');
var ResumePanel = require('../components/resumePanel.js');
var Form = require('../components/form/form.js');

var $ = require('jquery');

var addPool = React.createClass({
  displayName: 'addPool',

  handleChange: function(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    var data = this.state.data;
    data[target.name] = value;
    this.setState({
      'data': data
    });
  },

  getDefaultProps: function () {
    return {
      logger: null,
      subnets:[]
    };
  },

  getInitialState: function () {
    return {
      showSubnetList:true,
      showIpList:false,
      selectedSubnets:[],
      selectedResumeSubnets:[],
      data:{
        pool_name:'[Name]',
        number_subnets:null,
        number_ips:null
      }
    };
  },

  minus: function (){

    var ips = (this.state.data.number_ips == null)
          ?0:this.state.data.number_ips;

    if(this.state.data.number_ips > 0 ){
      ips = parseInt(ips) - 1;

      var data = this.state.data;
      data['number_ips'] = ips;
      this.setState({
        'data': data
      });
    }

  },

  plus: function (){

    var ips = (this.state.data.number_ips == null)
              ?0:this.state.data.number_ips;
    ips = parseInt(ips) + 1;
    var data = this.state.data;
    data['number_ips'] = ips;
    this.setState({
      'data': data
    });
},

  addSubnet: function(){
    //Add subnet
    console.log('datarrrrrrr', this.state.data);
  },

  addIP: function(){
    //Add subnet
    console.log('datarrrrrrr', this.state.data);

  },

  getSubnetTableConfiguration: function(){
    return {
      selectActions: [
            {
              label:'Select all available',
              string:"select_available",
              query:{"status":"available"}
            },
            {
              label:'Select none',
              string:"select_none",
              query:{"none":"none"}
            }
      ],
      columns: ['Subnet ID'],
      title: 'Added Subnets',
      noData: 'No added Subnets',
      refresh: Number(32000),
      recordsPerPage: 10,
      id: 'subnet_cidr',
      search: {hide:true},
      catalogueClass: 'catalogue-ligth',
      source: '/data/' + datamanager.data.activeTenant.id
            + '/volumes/detail',
      onMount: function(){},
      actions: [
        {
            label: 'Remove',
            name: 'Remove',
            onClick: function (props, state) {
                ReactDOM.render(<CustomModal {...modalParams} />,
                document.getElementById('temp-volume-create-modal'));
            },
            onDisabled: function () {}
        }
      ]
    }
  },
  getIpTableConfiguration: function(){
    return {
      selectActions: [],
      columns: ['IP Adress', 'Adress ID'],
      title: 'Added IPs',
      noData: 'No added IPs',
      refresh: Number(32000),
      recordsPerPage: 10,
      id: 'ip_cidr',
      search: {hide:true},
      catalogueClass: 'catalogue-ligth',
      source: '/data/' + datamanager.data.activeTenant.id
            + '/volumes/detail',
      onMount: function(){},
      actions: [
        {
            label: 'Remove',
            name: 'Remove',
            onClick: function (props, state) {
                ReactDOM.render(<CustomModal {...modalParams} />,
                document.getElementById('temp-volume-create-modal'));
            },
            onDisabled: function () {}
        }
      ]
    }
  },

  renderForm: function(){

    var buttonMinus = <Button bsStyle="primary"
      onClick={this.minus} >-</Button>;
    var buttonPlus  = <Button bsStyle="primary"
      onClick={this.plus} >+</Button>;

    return (
      <div>

        <Input label="Pool Name"
          placeholder="Enter Pool Name"
          name="pool_name"
          value={this.state.data.name}
          onChange={this.handleChange}
          type="text"/>

        <div className="form-group">
          <div >Add Availables Subnets</div>
          <div className="help-form">*Only one subnet can be added at a time</div>
          <Row className="show-grid">
            <Col md={3}>
              <Button bsStyle="primary"  onClick={this.addSubnet}>
                Add
              </Button>
            </Col>
          </Row>
        </div>

        <div className="form-group">
          <label>Add Availables IPs</label>
          <Row className="show-grid">
            <Col md={9}>
              <Input
                placeholder="0"
                value={this.state.data.number_ips}
                onChange={this.handleChange}
                type="number"
                name="number_ips"
                buttonBefore={buttonMinus}
                buttonAfter={buttonPlus}/>
            </Col>
            <Col md={3}>
              <Button bsStyle="primary" onClick={this.addIP}>
                Add
              </Button>
            </Col>
          </Row>
        </div>

      </div>
    );
  },

  renderResumePanel: function(){

    return (
      <div>
        <div className="frm-panel-heading frm-panel-heading-dotted ">
          {this.state.data.pool_name}
        </div>
        <div className="panel frm-panel-dotted">
          <div className="panel-body">
            <Catalogue {...this.getSubnetTableConfiguration()}/>
            <Catalogue {...this.getIpTableConfiguration()}/>
          </div>
        </div>
      </div>
    );
  },

  render: function () {
    return (
      <form>
        <Grid>
          <Row className="show-grid">
            <Col md={4}>
              {this.renderForm()}
            </Col>
            <Col md={5} xsOffset={2}>
              {this.renderResumePanel()}
              <Button type="submit">
                Create Pool
              </Button>
            </Col>
          </Row>
        </Grid>
      </form>
    );
  }

});

module.exports = addPool;
