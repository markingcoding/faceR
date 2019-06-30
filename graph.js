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
    const margin = {
        top: 30,
        right: 50,
        bottom: 30,
        left: 50
    };
    const videoInput = $("#video");
    let width;
    let height;
    let svg;
    let xScale;
    let yScale;
    let xAxis;
    let yAxis;
    let line1;
    let line2;
    let line3;
    let line4;
    let heightFix = 70
    let d3graph = $(".d3graph")
    function initGraph() {
        d3graph.css('opacity', '0');
        d3graph.width(videoInput.width())
        d3graph.height(videoInput.height() + heightFix)
        d3.select("svg").remove();
        width = videoInput.width() - margin.left - margin.right;
        height = videoInput.height() + heightFix - margin.top - margin.bottom;
        heightFix = 0;
        xScale = d3.time.scale()
            .range([0, width]);

        yScale = d3.scale.linear()
            .range([height, 0])
            .domain([0, 10]);

        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(10)
            .tickFormat(d3.time.format('%M:%S'));

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

        line1 = d3.svg.line()
            .x(function (d) {
                return xScale(d.time);
            })
            .y(function (d) {
                return yScale(d.intercostal);
            })
            .interpolate("cardinal");
        line2 = d3.svg.line()
            .x(function (d) {
                return xScale(d.time);
            })
            .y(function (d) {
                return yScale(d.mouth);
            })
            .interpolate("cardinal");
        line3 = d3.svg.line()
            .x(function (d) {
                return xScale(d.time);
            })
            .y(function (d) {
                return yScale(d.inin);
            })
            .interpolate("cardinal");
        line4 = d3.svg.line()
            .x(function (d) {
                return xScale(d.time);
            })
            .y(function (d) {
                return yScale(d.stress);
            })
            .interpolate("cardinal");
        svg = d3.selectAll(".d3graph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }
    initGraph();
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




