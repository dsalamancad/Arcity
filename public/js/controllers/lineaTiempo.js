var margin = {
                top: 10,
                right: 40,
                bottom: 30,
                left: 40
            },
            width = 960 - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom;

        var x = d3.time.scale()
            .domain([new Date(2013, 7, 1), new Date(2013, 7, 15) - 1])
            .range([0, width]);

        var brush = d3.svg.brush()
            .x(x)
            .extent([new Date(2013, 7, 2), new Date(2013, 7, 3)])
            .on("brushend", brushended);

        var svg = d3.select("#timeSlider").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("rect")
            .attr("class", "grid-background")
            .attr("width", width)
            .attr("height", height);

        svg.append("g")
            .attr("class", "x grid")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(d3.time.hours, 12)
                .tickSize(-height)
                .tickFormat(""))
            .selectAll(".tick")
            .classed("minor", function (d) {
                return d.getHours();
            });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(d3.time.days)
                .tickPadding(0))
            .selectAll("text")
            .attr("x", 6)
            .style("text-anchor", null);

        var gBrush = svg.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.event);

        gBrush.selectAll("rect")
            .attr("height", height);

        function brushended() {
            if (!d3.event.sourceEvent) return; // only transition after input
            var extent0 = brush.extent(),
                extent1 = extent0.map(d3.time.day.round);

            // if empty when rounded, use floor & ceil instead
            if (extent1[0] >= extent1[1]) {
                extent1[0] = d3.time.day.floor(extent0[0]);
                extent1[1] = d3.time.day.ceil(extent0[1]);
            }

            d3.select(this).transition()
                .call(brush.extent(extent1))
                .call(brush.event);
        }