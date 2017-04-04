// React js component
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;

var Grid = ReactBootstrap.Grid,
    Row = ReactBootstrap.Row,
    Col = ReactBootstrap.Col,
   Table = ReactBootstrap.Table,
   Alert = ReactBootstrap.Alert;

var InputElement = require('react-input-mask')
var $ = require('jquery');

var addPool = React.createClass({
  displayName: 'addPool',
  subnet:'',

  getDefaultProps: function () {
    return {
      logger: null
    };
  },

  getInitialState: function () {
    return {
      status:'creating', //Current state (creating/editing)
      generalError:'',//Error while creating a pool,
      createdPool:{},//Pool that has been created
      subnets:[],
      ips:[],
      selectedRows:[], //ips selected
      // <all> All ips are selecte, <none> none ip is selected
      selectStatus:null,
      errorMessageIP:'',//error message when adding an ip
      validIP:true,//flag to determine if a ip is valid
      errorMessageSubnet:'',//error message when adding subnet
      validSubnet:true,//flag to determine if subnet is valid
      pool:{ //Pool to create
        name:'',
        subnet:'',
        preSubnet:'###.##.#.',
        notation:'24',
        ip:'',
        ips:[],
        number_ips:1
      }
    };
  },

/*Get options*/

  //Receive a list of pool and a name
  //Retrieve the pool filtering by name
  findPool: function(pools, name){
    return pools.find(function (pool) {
        return pool['name'] == name;
    });
  },

  //Search pool in backend
  getPool: function(pool){

    $.get({url:"/data/pools/" + pool.id}) //Get all th infor of the pool
      .done(function (pool) {
        this.setState({
          'status':'editing',
          'createdPool': pool,
          ips:(pool.ips)?pool.ips:[],
          subnets:(pool.subnets)?pool.subnets:[],
          'generalError':''
        })
      }.bind(this))
      .fail(function (err) {
        console.log('error', err);
        this.setState({
          'generalError':err
        })
      })
  },

  /*Add options*/
  addPool: function () {

    var poolToCreate = {};
    poolToCreate = this.state.pool;
    var ip = poolToCreate.ips[0];
    //poolToCreate.ips.shift();
    poolToCreate.ips = poolToCreate.ips.map(function(ip){
        return {'ip':ip}
    })

    //Create subnet
    var subnet = poolToCreate.subnet.replace(/_/g, '');
    if(poolToCreate.notation.replace(/ /g, '') != ''){
      subnet = subnet +'/' + this.state.pool.notation;
    }

    var body = {
          "name": poolToCreate.name,
          "Subent": subnet,
          "ips": JSON.stringify( poolToCreate.ips ),
          "ip":ip
    };

    //TODO: async
    $.post({
        url:"/data/pools",
        data:body
    })
    .done(function (pool) {

      if(pool.error == '204'){//success
        $.get({url:"/data/pools/"}) //Obtain all pools
        .done(function (pools) {
          //search and set (just created) pool
          var pool = this.findPool(pools.pools, this.state.pool.name);
          this.getPool(pool);

        }.bind(this))
        .fail(function (err) {
          console.log('error', err);
          this.setState({
            'generalError':err
          })
        })
      }else{
        this.setState({
          'generalError':'The named pool "'+ this.state.pool.name
          +'" could not be created. Please verify your information'
        })
      }
    }.bind(this))
    .fail(function (err) {
      console.log('err', err);
      //Show message error
    });
},

/*Remove options*/

  removeSubnet: function(subnet){

    $.ajax({
      url: "/data/pools/"+this.state.createdPool.id+"/subnets/"+subnet.id,
      type: "DELETE",
      dataType: "application/json"
    })
    .done(function(response){
      if(response.error == '204'){//success
        //Get updated Pool
        this.getPool(pool);
      }
    }.bind(this))
    .fail(function(){
      this.getPool(pool);
    }.bind(this))
  },

 /* Remove ips from pool
  * Make a post peticion to remove ip(s)
  */
  removeIps: function(){

    var ipsToRemove = [];

    if(this.state.selectStatus == 'all'){//remove all
      ipsToRemove = this.state.ips;
    }else{
      ipsToRemove = this.state.selectedRows;
    }

    //TODO: async
    ipsToRemove.forEach(function(ip){
      $.ajax({
        url: "/data/external-ips/"+ip.id,
        type: "DELETE",
        dataType: "application/json"
      })
      .done(function(response){
        $.ajax({
          url: "/data/pools/"+this.state.createdPool.id+'/external-ips/'+ip.id,
          type: "DELETE",
          dataType: "application/json"
        })
        .done(function(response){
          if(response.error == '204'){//success
            //Get updated Pool
            this.getPool(pool);
          }
        }.bind(this))
        .fail(function(response){
          this.getPool(pool);
        }.bind(this))

      }.bind(this))


    }.bind(this))

  },

/*Form functions*/

  /*
  * Validate IP is valid
  * IP is not bigger than 255
  * IP is not zero
  */
  validateIP: function(value){

    var errorMessage = '';

    if(value == 0){
      errorMessage = 'IP can not be empty or zero';
    }

    if(!errorMessage && value > 255){
      errorMessage = 'IP can not be bigger than 255';
    }

    if(errorMessage != ''){
      this.setState({
        'errorMessageIP': errorMessage,
        validIP:false
      });
    }else{
      this.setState({
        'errorMessageIP': '',
        validIP:true
      });
    }

  },

  validateSubnet(subnet){
    var subnet = subnet.replace(/_/g, '');
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(subnet)) {
      this.setState({
        'errorMessageSubnet': '',
        validSubnet:true
      });
    } else{
      this.setState({
        'errorMessageSubnet': 'This is not a valid ip',
        validSubnet:false
      });
    }
  },

  //Add new ip
  addIP: function(){
    var actualPool = this.state.pool;
    var newIP = this.state.pool.preSubnet + this.state.pool.ip;
    actualPool.ips.push(newIP);
    actualPool.ip = '';

    this.setState({
      'pool': actualPool
    });
  },

  handleChange: function(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    var data = this.state.pool;
    data[target.name] = value;

    if(target.name == 'subnet'){
      if(value != '___.___.___.___'){//subnet is not empty
        var subnetArray = value.split('.');
        var tmpSubnet = '';

        subnetArray.forEach(function(element, index){
          if(index < 3){
            tmpSubnet = tmpSubnet + element + '.';
          }
        })
        data['preSubnet'] = tmpSubnet.replace(/_/g, '');
      }
    }

    if(target.name == 'ip'){//validate is a correct ip
      this.validateIP(value)
    }

    if(target.name == 'subnet'){//validate is a correct ip
      this.validateSubnet(value)
    }

    this.setState({
      'pool': data
    });
  },

  disabledAddIPButton: function(){
    if(this.state.pool.ip != ''
      && this.state.validIP
      && this.state.validSubnet){
      return false;
    }else{
      return true;
    }
  },

  disabledCreatePool: function(){
    var disabled = false;
    var name = this.state.pool.name;

    if(this.state.status == 'editing'){
      disabled = true;
    }

    if(name.replace(/ /g, '') == ''){
        disabled = true;
    }
    return disabled;
  },

  disabledForm:function(){
    var disabled = false;

    if(this.state.status == 'editing'){
      disabled = true;
    }
    return disabled;
  },

  disabledRemoveIPButton: function(){
    var shouldDisabled = false;
    if(this.state.selectStatus == 'none'){
      shouldDisabled = true;
    }else{
      if(this.state.selectStatus != 'all'){
        if(this.state.selectedRows.length == 0){
          shouldDisabled = true;
        }
      }
    }

    return shouldDisabled;
  },

/*Table functions*/

  isChecked: function (row) {

    if(this.state.selectStatus == 'all'){
      return true;
    }else{
      if(this.state.selectStatus == 'none'){
        return false;
      }else{
        var entry = this.state.selectedRows.find(function (element) {
            return element['id'] == row['id'];
        });
        return entry;
      }
    }
  },

  selectAll: function () {

    if(this.state.selectStatus == 'all'){
      this.setState({
        'selectStatus': 'none'
      });
    }else{
      this.setState({
        'selectStatus': 'all'
      });
    }
  },

  selectRow: function (selectedRow) {
    var key = 'id';
    var newSelected = [];

    //first element
    if(this.state.selectedRows.length == 0){
        newSelected.push(selectedRow);
    }else{
        var indexRow = this.state.selectedRows.findIndex(function (row) {
            return row[key] == selectedRow[key];
        });

        this.state.selectedRows.forEach(function (element, index) {
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

    this.setState({
      'selectedRows': newSelected,
      'selectStatus': null
    });
},

/*Render*/
  getSubnetTable: function(){

    var subnets = this.state.subnets.map((subnet, i) => {
            return(
              <tr key={i}>
                <td> {subnet.id} </td>
                <td>
                  <Button
                    onClick={this.removeSubnet.bind(null,subnet)}>
                    Remove
                  </Button>
                </td>
              </tr>
            );
    });

    return (
      <div className="catalogue-ligth">
        <h2>
          Added Subnets
        </h2>

        <Table responsive>
          <thead>
            <tr>
              <th>Subnet ID</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {subnets}
          </tbody>
        </Table>
      </div>
    )
  },

  getIpTable: function(){

    var ips = this.state.ips.map((ip, i) => {
        return(
              <tr key={i}>
                <td>
                <Input
                  type="checkbox"
                  checked={this.isChecked(ip)}
                  onClick={this.selectRow.bind(null, ip)}
                  />
                </td>
                <td>
                  {ip.id}
                </td>
                <td>
                  {ip.address}
                </td>
              </tr>
            );
    });

    return (
      <div className="catalogue-ligth">
        <h2>
          Added IPs
          <Button
            onClick={this.removeIps}
            disabled={this.disabledRemoveIPButton()}>
            Remove
          </Button>
        </h2>

        <Table responsive>
          <thead>
            <tr>
              <th>
              <Input
                type="checkbox"
                checked={this.state.selectStatus == 'all'}
                onClick={this.selectAll}
                />
              </th>
              <th>IP ID</th>
              <th>IP Adress</th>
            </tr>
          </thead>
          <tbody>
            {ips}
          </tbody>
        </Table>
      </div>
    )
  },

  renderForm: function(){
    var ips = this.state.pool.ips.map((ip, i) => {
        return(
          <tr key={i}>
            <td>
              <label> {ip.ip || ip} </label>
            </td>
          </tr>
        );
    });

    return (
      <div>

        <Input label="Pool Name"
          placeholder="Enter Pool Name"
          name="name"
          value={this.state.pool.name}
          onChange={this.handleChange}
          disabled={this.disabledForm()}
          type="text"/>

        <div className="form-group">
          <label>
            Add Available Subnet
          </label>
          <Row className="show-grid">
            <label className="text-danger">
              {this.state.errorMessageSubnet}
            </label>
            <Col md={7}>
              <InputElement
                name="subnet"
                mask="999.999.999.999"
                placeholder='###.###.##.#'
                value={this.state.pool.subnet}
                onChange={this.handleChange}
                disabled={this.disabledForm()}
                className="form-control"
                type="text"/>
            </Col>
            <Col md={1}>
              <label className="notation-slash">
                /
              </label>
            </Col>
            <Col md={3}>
              <Input
                name="notation"
                value={this.state.pool.notation}
                onChange={this.handleChange}
                disabled={this.disabledForm()}
                className="form-control"
                type="text"/>
            </Col>
          </Row>
        </div>

        <div className="form-group">
          <Row className="show-grid">
            <Col md={12}>
              <label className="add-margin-top">
                Add a new IP
              </label>
              <hr className="remove-margin-top"/>
              <label className="text-danger">
                {this.state.errorMessageIP}
              </label>
            </Col>
          </Row>
          <Row className="show-grid">
            <Col md={4}>
              <label className="add-mini-margin-top">
                {this.state.pool.preSubnet}
              </label>
            </Col>
            <Col md={4}>
              <InputElement
                name="ip"
                value={this.state.pool.ip}
                onChange={this.handleChange}
                disabled={this.disabledForm()}
                className="form-control"
                type="text"/>
            </Col>
            <Col md={2}>
              <Button bsStyle="primary"
                onClick={this.addIP}
                disabled={this.disabledAddIPButton()}>
                Add IP
              </Button>
            </Col>
          </Row>

          <Row className="show-grid">
            <Col md={12}>
              <label className="add-margin-top">
                IPs
              </label>
            </Col>
            <Col md={12}>
            <Table striped bordered condensed>
              <tbody>
                {ips}
              </tbody>
            </Table>
            </Col>
          </Row>
        </div>

      </div>
    );
  },

  renderResumePanel: function(){

    if(this.state.status == 'editing'){

      return (
        <div>
          <div className="frm-panel-heading frm-panel-heading-dotted ">
            {this.state.pool.name }
          </div>
          <div className="panel frm-panel-dotted">
            <div className="panel-body">
              {this.getSubnetTable()}
              {this.getIpTable()}
            </div>
          </div>
        </div>
      );
    }
  },

  render: function () {
    let alert = '';
    if (this.state.generalError != '') {
      alert = (
        <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}>
          <h4>We could not create the pool!</h4>
          <p>There seems to be a problem with the pool you are
          trying to create, please verify your information.</p>
        </Alert>);
    }

    return (
      <form>
        <Grid>
          <Row className="show-grid">
            {alert}
            <Col md={4}>
              {this.renderForm()}
              <Button
                onClick={this.addPool}
                disabled={this.disabledCreatePool()}
                className="button-form">
                Create Pool
              </Button>
            </Col>
            <Col md={5} xsOffset={2}>
              {this.renderResumePanel()}
            </Col>
          </Row>
        </Grid>
      </form>
    );
  }

});

module.exports = addPool;
