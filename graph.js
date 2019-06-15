'use strict';

    let dataset = [];
    function generateData(intercostal, mouth, inin, stress){
        const now = new Date();
        const data = {
            time: now,
            intercostal: intercostal,
            mouth: mouth,
            inin: inin,
            stress: stress
        };
        dataset.push(data)
    }
    //xŽ²‚ÍŽžŠÔ‚ÌƒXƒP[ƒ‹‚É‚È‚é‚æ‚¤‚ÉÝ’è
    var margin = {
        top: 30,
        right: 50,
        bottom: 30,
        left: 50
    };
    var width = 540 - margin.left - margin.right;
    var height = 360 - margin.top - margin.bottom;

    var xScale = d3.time.scale()
        .range([0, width]);

    var yScale = d3.scale.linear()
        .range([height, 0])
        .domain([0, 10]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(10)
        .tickFormat(d3.time.format('%M:%S'));

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    var line1 = d3.svg.line()
        .x(function (d) {
            return xScale(d.time);
        })
        .y(function (d) {
            return yScale(d.intercostal);
        })
        .interpolate("cardinal");
    var line2 = d3.svg.line()
        .x(function (d) {
            return xScale(d.time);
        })
        .y(function (d) {
            return yScale(d.mouth);
        })
        .interpolate("cardinal");
    var line3 = d3.svg.line()
        .x(function (d) {
            return xScale(d.time);
        })
        .y(function (d) {
            return yScale(d.inin);
        })
        .interpolate("cardinal");
    var line4 = d3.svg.line()
        .x(function (d) {
            return xScale(d.time);
        })
        .y(function (d) {
            return yScale(d.stress);
        })
        .interpolate("cardinal");
    var svg = d3.selectAll(".d3graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function update() {
        if (dataset.length > width / 20) {
            dataset.shift();
        }
        svg.selectAll("path").remove();
        svg.selectAll("g").remove();

        xScale.domain(d3.extent(dataset, function (d) {
            return d.time;
        }));
        yScale.domain([0,500]).nice();

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("y", -10)
            .attr("x", 10)
            .style("text-anchor", "end")
            .text("’l");

        svg.append("g")
            .attr("class", "x axis")
            .call(xAxis)
            .attr("transform", "translate(0," + height + ")")

        svg.append("path")
            .datum(dataset)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line1);

        svg.append("path")
            .datum(dataset)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line2);

        svg.append("path")
            .datum(dataset)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line3);

        svg.append("path")
            .datum(dataset)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line4);
    };




