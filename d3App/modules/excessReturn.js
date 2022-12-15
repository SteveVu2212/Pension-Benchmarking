
function drawExcessReturn_(
    data,
    dimensions,
    plan,
    benchmark,
    bound
){
    const yearAccessor = d => parseInt(d.fy)
    let benchmarkReturnAccessor
    if(benchmark === 'Optimal benchmark'){
        benchmarkReturnAccessor =  d => parseFloat(d.cum_opt_benchmark_excess)
    } else {
        benchmarkReturnAccessor = d => parseFloat(d.cum_custom_benchmark_excess)
    }

    // Create scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, yearAccessor))
        .range([0, dimensions.boundedWidth])
        .nice()
            
    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, benchmarkReturnAccessor))
        .range([dimensions.boundedHeight, 0])
        .nice()

    const dataNest = Array.from(
        d3.group(data, d => d.plan_name), ([key, value]) => ({key, value})
    );

    const line = d3.line()
        .x(d => xScale(yearAccessor(d)))
        .y(d => yScale(benchmarkReturnAccessor(d)))

    const path_excessReturn = bound.select(".pathExcessReturn").selectAll("path")
        .data(dataNest)
        .join(
            enter => enter.append("path"),
            update => update,
            exit => exit.remove()
        )
        .transition().duration(500)
        .attr("d", d => line(d.value))
        .attr("fill", "none")
        .attr("stroke", d => d.key === plan ? "red" : "grey")
        .attr("stroke-opacity", d => d.key === plan ? 1 : 0.05)

    // Draw peripherals
    const yAxisGenerator = d3.axisLeft(yScale).ticks(6)
    const yAxis = bound.select(".y-axis").call(yAxisGenerator)

    const xAxisGenerator = d3.axisBottom()
                    .scale(xScale)
                    .tickFormat(d3.format(".0f"))
    const xAxis = bound.select(".x-axis")
                    .call(xAxisGenerator)
                    .style("transform", `translateY(${dimensions.boundedHeight}px)`)

    bound.select(".zeroLineExcessReturn").raise()
            .transition().duration(500)
            .attr("x1", xScale(xScale.domain()[0]))
            .attr("y1", yScale(0))
            .attr("x2", xScale(xScale.domain()[1]))
            .attr("y2", yScale(0))
            .style("stroke", "blue")
            .style("stroke-opacity", 0.5)
}

export {drawExcessReturn_}