
function drawCumReturns_(
    data,
    dimensions,
    plan,
    benchmark,
    bound
){
    const subDataset = data.filter(d => d.plan_name === plan)

    const actualReturnAccessor = d => parseFloat(d.cum_return)
    const yearAccessor = d => parseInt(d.fy)

    let benchmarkReturnAccessor
    if(benchmark === 'Optimal benchmark'){
        benchmarkReturnAccessor =  d => parseFloat(d.cum_opt_benchmark_return)
    } else {
        benchmarkReturnAccessor = d => parseFloat(d.cum_custom_benchmark_return)
    }

    const highestReturn = d3.max([d3.max(subDataset, benchmarkReturnAccessor),
        d3.max(subDataset, actualReturnAccessor)])

    // Create scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(subDataset, yearAccessor))
        .range([0, dimensions.boundedWidth])
        .nice()

    const yScale = d3.scaleLinear()
        .domain([1,highestReturn])
        .range([dimensions.boundedHeight, 0])
        .nice()

    // Draw data
    const lineGenerator_actualReturn = d3.line()
        .x(d => xScale(yearAccessor(d)))
        .y(d => yScale(actualReturnAccessor(d)))

    const lineGenerator_optimalReturn = d3.line()
        .x(d => xScale(yearAccessor(d)))
        .y(d => yScale(benchmarkReturnAccessor(d)))

    const transition = d3.transition()
                        .duration(500)

    const line_ActualReturn = bound
        .selectAll(".lineActualReturn")
        .data([subDataset])
        .join("path")
        .transition().duration(500)
        .attr("d", lineGenerator_actualReturn)
        .attr("class", "lineActualReturn")
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
                        

    const line_optimalReturn = bound
        .selectAll(".lineOptimalReturn")
        .data([subDataset])
        .join("path")
        .transition().duration(500)
        .attr("d", lineGenerator_optimalReturn)
        .attr("class", "lineOptimalReturn")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)

    // Draw peripherals
    const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(5)
    const yAxis = bound.select(".y-axis").call(yAxisGenerator)

    const xAxisGenerator = d3.axisBottom()
                    .scale(xScale)
                    .tickFormat(d3.format(".0f"))
    const xAxis = bound.select(".x-axis")
                    .call(xAxisGenerator)
                    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
}

export {drawCumReturns_}