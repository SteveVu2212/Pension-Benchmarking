
function drawAvgExcessReturn_(
    data,
    dimensions,
    plan,
    benchmark,
    bound,
    legend,
    tooltip
){
    const yearAccessor = d => parseInt(d.fy)
    const aalAccessor = d => parseFloat(d.aal)
    const percentFormat = d3.format(".2f");

    let benchmarkReturnAccessor
    if(benchmark === 'Optimal benchmark'){
        benchmarkReturnAccessor =  d => parseFloat(d.avg_opt_benchmark_excess)
    } else {
        benchmarkReturnAccessor = d => parseFloat(d.avg_custom_benchmark_excess)
    }


    const rScale = d3.scaleSqrt()
        .domain(d3.extent(data, aalAccessor))
        .range([0,50])

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, benchmarkReturnAccessor))
        // .domain([-0.15,0.1])
        .range([0, 0.9 * dimensions.boundedWidth])
        .nice()

    // Create nodes for each data points
    let nodes = data.map(function(d, i){
        return {
            id: "node" + i,
            x: xScale(benchmarkReturnAccessor(d)), 
            y: dimensions.boundedHeight / 2,
            r: rScale(aalAccessor(d)),
            rate: benchmarkReturnAccessor(d),
            cnt: aalAccessor(d),
            planName: d.plan_name,
            data: d
        }
    })


    const bubble_avgExcessReturn = bound
        .select(".bubbleAvgExcessReturn")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("id", d => "circle" + d.id)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr('fill', d => d.planName === plan ? "red": "grey")
        .attr('fill-opacity', d => d.planName === plan ? 0.5 : 0.2)
        .on("mouseover", function(e, d) {
            tooltip.html(d.planName + "<br/>" + percentFormat(d.rate) + "%")
            return tooltip.style('visibility', 'visible')
        })
        .on("mousemove", function(e, d){
            return tooltip.style("top", (e.pageY - 100) + "px").style("left", (e.pageX - 200) + "px");
        })
        .on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        });

    bubble_avgExcessReturn.transition()
        .delay((d, i) => i * 5)
        .duration(1000)
        .attrTween("r", d => {
            const i = d3.interpolate(0, d.r)
            return t => d.r = i(t)
        })

    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength([-0]))
        .force("x", d3.forceX(d => d.x))
        .force("y", d3.forceY(dimensions.boundedWidth/5))
        .force("collision", d3.forceCollide().radius(d => d.r + dimensions.padding))
        .alpha(.25)
        // .alphaDecay(0)


    simulation.on("tick", () => {
        bubble_avgExcessReturn.attr("cx", d => d.x)
                            .attr("cy", d => d.y)
                            .attr('fill', d => d.planName === plan ? "red": "grey")
    })

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => d + "%")
        .tickSize(8)
        .tickPadding(5)

    const xAxisEl = bound.select(".x-axis")
    xAxisEl.append("text")
        .attr("class", "axistitle")
        .attr("x", dimensions.width / 2)
        .attr("y", dimensions.margin.bottom - 10)
        .style("text-anchor", "middle")
        .style("fill", "grey")
        .style("fill-opacity", 1)
        .text("Average Excess Return")
    xAxisEl.call(xAxis)

    const zeroLine = bound.select(".zeroLine")
        .transition().duration(1000)
        .attr("x1", xScale(0))
        .attr("x2", xScale(0))
        .attr("y1", dimensions.height * 0.85)
        .attr("y2", - dimensions.height)
        .style("stroke", "blue")
        .style("stroke-dasharray", "2px 4px")

    legend.selectAll(".ind")
        .data([50000000, 250000000, 500000000])
        .join('circle')
        .attr("class", "ind")
        .attr("r", d => rScale(d))
        .attr("cx", 100)
        .attr("cy", d => 130 - rScale(d))
        .style("fill", "none")
        .style("stroke", '#ccc')

    legend.selectAll(".leglabel")
        .data([50000000, 250000000, 500000000])
        .join("text")
        .attr("class", "leglabel")
        .attr("x", 100)
        .attr("y", d => 130 - rScale(d) * 2)
        .attr("dy", -4)
        .text(d => d3.format(",")(d / 1000000) + "mn")
        .style("font-size", ".7rem")
        .style("text-anchor", "middle")

}

export {drawAvgExcessReturn_}