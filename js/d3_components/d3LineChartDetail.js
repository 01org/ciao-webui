// d3 component: LineChart Detail
// this element consists of a linechart that will be filled
// with the current "diagnostic" of an object

var d3 = require('d3');

var d3LineChartDetail = {};

var lineChart = function (svgEl, bundle, state) {
    this.svgEl = svgEl;
    this.props = bundle.props;
    this.state = state;

    this.width = (bundle.dimensions.width)?
        bundle.dimensions.width: this.props.width;
    this.height = (bundle.dimensions.height)?
        bundle.dimensions.height: this.props.height;

    this.margin = {top: 10,
                  right: this.width * 0.05,
                  bottom: 0,
                  left: this.width * 0.1};

    var from = state.timeFrom;
    var to = state.timeTo;

    this.computeData = this.props.data.filter((d) => {
        return (from.getTime() <= (new Date(d.dateValue)).getTime())
            &&
            (to.getTime() >= (new Date(d.dateValue)).getTime());
    });

    // setup multipliers for height and width
    this.hmult = bundle.hmult;
    this.wmult = bundle.wmult;

    this.computeX = this.x();
    this.computeY = this.y();

    //set domain based on the data
    this.updateDomain();

};

lineChart.prototype.y = function (mult) {
    var h = (mult != undefined) ? this.height * mult: this.height * this.hmult;
    return d3.scale.linear()
        .range([h,0]);
};

lineChart.prototype.x = function (mult) {
    var w = (mult != undefined) ? this.width: this.width;
    return d3.time.scale()
        .range([0, w - this.margin.left - this.margin.right]);
};

lineChart.prototype.setState = function (state) {
    this.state = state;
    var from = state.timeFrom;
    var to = state.timeTo;
        this.computeData = this.props.data.filter((d) => {
        return (from.getTime() <= (new Date(d.dateValue)).getTime())
            &&
            (to.getTime() >= (new Date(d.dateValue)).getTime());
    });

    this.updateDomain();
};

lineChart.prototype.updateDomain  = function () {

    this.computeX
        .domain([
            this.state.timeFrom,this.state.timeTo
        ]);

    this.computeY
        .domain(d3.extent(this.computeData, function(d) {
            return d.usageValue;}));

    //re-compute line, x and y axis functions
    this.line = d3.svg.line()
        .interpolate("monotone")
        .x((d) => this.computeX(new Date(d.dateValue)))
        .y((d) => this.computeY(d.usageValue));

    this.xAxis = d3.svg.axis()
        .scale(this.computeX)
        .orient("bottom")
        .ticks(3)
        .tickFormat(d3.time.format("%d/%m/%Y"));

    this.yAxis = d3.svg.axis()
        .scale(this.computeY)
        .orient("left");
        //.ticks(5,"%");


    this.area = d3.svg.area()
        .interpolate("monotone")
        .x((d) => this.computeX(new Date(d.dateValue)))
        .y0(this.height*this.hmult)
        .y1((d) => this.computeY(d.usageValue));
};

lineChart.prototype.setData = function (data) {
    this.props.data = data;
    this.updateDomain();
};

lineChart.prototype.render = function () {
    //remove all childs of parent node for new drawing
    d3.select(this.svgEl).selectAll("*").remove();

    // select parent and create a canvas to add all components on the chart
    var svg = d3.select(this.svgEl)
        .attr("class", "d3")
        .attr("width", this.width)
        .attr("height",this.height)
        .append("g")
        .attr("transform", "translate(" +
              this.margin.left + "," +
              this.margin.top + ")");

    svg.append("path")
         .datum(this.computeData)
         .attr("class", "area")
         .attr("d", this.area);


    // Draw line passing data and using the line function
    svg.append("path")
        .datum(this.computeData)
        .attr("class", "line data-line")
        .attr("d", this.line);
        //.attr("transform", "translate(-100,0)");

    // Axis drawing
    //draw xAxis
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + (this.height*this.hmult) + ")")
      .call(this.xAxis);

    //select all individual xAxis text
    svg.selectAll(".x-axis text")
        .attr("transform", "translate(0,15)rotate(-20)");

    svg.append("g")
        .attr("class", "y-axis")
        .call(this.yAxis);

    return this.svgEl;
};
// svgEl parameter must be an SVG element
d3LineChartDetail.create = function (svgEl, bundle, state) {
    //Note:multiplier might come in bundle
    bundle.wmult = 0.8;
    bundle.hmult = 0.8;
    var chart = new lineChart(svgEl, bundle, state);
    return chart;
};


module.exports = d3LineChartDetail;
