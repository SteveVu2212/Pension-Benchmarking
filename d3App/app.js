async function draw(){

    // 1. Access data
    const df_avg_returns = await d3.csv("../ppd_avg_returns_final.csv")
    const df_cum_returns = await d3.csv("../ppd_cum_returns.csv")

    

    const defaultPlan = "Alabama ERS"
    const defaultBenchmarkType = "Optimal benchmark"

    let allPlanNames = new Array()
    df_avg_returns.forEach(d => allPlanNames.push(d.plan_name))
    // console.log(allPlanNames)

    //format the year 
    // const parseTime = d3.timeParse("%Y");

    // df_avg_returns.forEach(function (d) {
    //     d.fy = parseTime(d.fy);});

    //     df_cum_returns.forEach(function (d) {
    //     d.fy = parseTime(d.fy);});

    // console.log(df_cum_returns)

    const periodSelection = ['10 years', '15 years', '20 years']
    const benchmarkTypeSelection = ['Optimal benchmark',
                            'NonUSEquity(20%)-USEquity(50%)-USBond(30%)'
                            ]
    const labels = ['Cummulative actual return', 'Cummulative benchmark return']

    // 2. Create chart dimensions
    const padding = 1
    const width = 500
    let dimensions = {
      width: width,
      height: width * 0.6,
      margin: {
        top: 30,
        right: 20,
        bottom: 50,
        left: 50,
      },
    }
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

    // Users' selection - Add dropdowns
    const userSelection = d3.select("#userSelection")

    userSelection.select("select.planSelection")
        .selectAll("option")
        .data(allPlanNames)
        .join("option")
        .text(d => d)
        .attr("value", d => d)

    userSelection.select("select.benchmarkSelection")
        .selectAll("option")
        .data(benchmarkTypeSelection)
        .join("option")
        .text(d => d)
        .attr("value", d => d)

    userSelection.select("select.periodSelection")
        .selectAll("option")
        .data(periodSelection)
        .join("option")
        .text(d => d)
        .attr("value", d => d)

    // Initial options
    let planSelected = d3.select("select.planSelection").property("value")
    let benchmarkSelected = d3.select("select.benchmarkSelection").property("value")

    // 3. Draw canvas - Cummulative Return Chart

    const wrapper_cummulativeReturn = d3.select("#wrapper-cummulativeReturn")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    const bounds_cummulativeReturn = wrapper_cummulativeReturn.append("g")
        .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

    bounds_cummulativeReturn.append("g")
        .attr("class", "x-axis")
        .style("transform", `translateY(${dimensions.boundedHeight})`)
    
    bounds_cummulativeReturn.append("g")
        .attr("class", "y-axis")

    // Add legend
    const colorScale = d3.scaleOrdinal()
        .domain(labels)
        .range(['blue', 'red'])

    const labelDots = bounds_cummulativeReturn.append("g")
                .attr("class", "labeldots")

    labelDots.selectAll("circle")
        .data(labels)
        .enter()
        .append("circle")
        .attr("cx", dimensions.boundedWidth * 0.1)
        .attr("cy", (d,i) => dimensions.boundedHeight * (i+1)/10)
        .attr("r", 4)
        .style("fill", d => colorScale(d))

    const labelText = bounds_cummulativeReturn.append("g")
            .attr("class", "labeltext")

    labelText.selectAll("circle")
        .data(labels)
        .enter()
        .append("text")
        .attr("x", dimensions.boundedWidth * 0.15)
        .attr("y", (d,i) => dimensions.boundedHeight * (i+1)/9)
        .style("fill", "black")
        .text(d => d)

    const drawCumReturns = () => {
        const subDataset = df_cum_returns.filter(d => d.plan_name === planSelected)

        const actualReturnAccessor = d => parseFloat(d.cum_return)
        const yearAccessor = d => parseInt(d.fy)

        let benchmarkReturnAccessor
        if(benchmarkSelected === 'Optimal benchmark'){
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
                            // .ease(d3.easeSin)

        // const line_ActualReturn = bounds_cummulativeReturn.selectAll(".lineActualReturn").data([subDataset])
        // const newLine_ActualReturn = line_ActualReturn.enter()
        //                             .append("path")
        //                             .attr("d", lineGenerator_actualReturn)
        //                             .attr("class", "lineActualReturn")
        //                             .attr("fill", "none")
        //                             .attr("stroke", "blue")
        //                             .attr("stroke-width", 2)
        
        // const allLine_ActualReturn = newLine_ActualReturn.merge(line_ActualReturn)
        // allLine_ActualReturn
        //     .transition(transition)
        //     .attr("d", lineGenerator_actualReturn)

        // const oldLine_ActualReturn = line_ActualReturn
        //                             .exit()
        //                             .transition(transition)
        //                             .remove()

        const line_ActualReturn = bounds_cummulativeReturn.selectAll(".lineActualReturn")
                                        .data([subDataset])
                                        .join("path")
                                        .transition().duration(500)
                                        .attr("d", lineGenerator_actualReturn)
                                        .attr("class", "lineActualReturn")
                                        .attr("fill", "none")
                                        .attr("stroke", "blue")
                                        .attr("stroke-width", 2)
                                        

        const line_optimalReturn = bounds_cummulativeReturn.selectAll(".lineOptimalReturn")
                                        .data([subDataset])
                                        .join("path")
                                        .transition().duration(500)
                                        .attr("d", lineGenerator_optimalReturn)
                                        .attr("class", "lineOptimalReturn")
                                        .attr("fill", "none")
                                        .attr("stroke", "red")
                                        .attr("stroke-width", 2)

        // const line_optimalReturn = bounds_cummulativeReturn.selectAll(".lineOptimalReturn").data([subDataset])
        // const newLine_OptimalReturn = line_ActualReturn.enter()
        //                             .append("path")
        //                             .attr("d", lineGenerator_optimalReturn)
        //                             .attr("class", "lineOptimalReturn")
        //                             .attr("fill", "none")
        //                             .attr("stroke", "red")
        //                             .attr("stroke-width", 2)

        // const allLine_OptimalReturn = newLine_OptimalReturn.merge(line_optimalReturn)
        // allLine_OptimalReturn
        //     .transition(transition)
        //     .attr("d", lineGenerator_optimalReturn)

        // const oldLine_OptimalReturn = line_optimalReturn
        //                             .exit()
        //                             .transition(transition)
        //                             .remove()


        // Draw peripherals
        const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(5)
        const yAxis = bounds_cummulativeReturn.select(".y-axis").call(yAxisGenerator)

        const xAxisGenerator = d3.axisBottom()
                        .scale(xScale)
                        .tickFormat(d3.format(".0f"))
        const xAxis = bounds_cummulativeReturn.select(".x-axis")
                        .call(xAxisGenerator)
                        .style("transform", `translateY(${dimensions.boundedHeight}px)`)

        // Set up interactions
    }

    // Draw canvas - Average returns

    const wrapper_avgReturn = d3.select("#wrapper-avgReturn")
        .append("svg")
        .attr("width", dimensions.width / 2)
        .attr("height", dimensions.height)

    const bounds_avgReturn = wrapper_avgReturn.append("g")
        .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

    bounds_avgReturn.append("g")
        .attr("class", "circleAvgReturn")

    bounds_avgReturn.append("g")
        .attr("class", "y-axis")
        .style("transform", `translateX(${dimensions.width/4}px)`)

    const drawAvgReturn = () => {

        const minValue = d3.min([
            d3.min(df_avg_returns, d => parseFloat(d.avg_opt_benchmark_return)),
            d3.min(df_avg_returns, d => parseFloat(d.avg_custom_benchmark_return))
        ])

        const maxValue = d3.max([
            d3.max(df_avg_returns, d => parseFloat(d.avg_opt_benchmark_return)),
            d3.max(df_avg_returns, d => parseFloat(d.avg_custom_benchmark_return))
        ])

        const subDataset = df_avg_returns.filter(d => d.plan_name === planSelected)

        const avgOptBenchmarkReturn = subDataset[0].avg_opt_benchmark_return
        const avgCustomBenchmarkReturn = subDataset[0].avg_custom_benchmark_return
        const actualAvgReturn = subDataset[0].avg_return

        // Create nodes for each data points
        let nodes = [
            benchmarkSelected === 'Optimal benchmark' ? avgOptBenchmarkReturn : avgCustomBenchmarkReturn,
            actualAvgReturn
        ]

        
        const yScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range([dimensions.boundedHeight, 0])
            .nice()


        const circle_avgReturn = d3.select(".circleAvgReturn")
                .selectAll("circle")
                .data(nodes)
                .join("circle")
                .transition().duration(500)
                .attr("cx", dimensions.width / 4 )
                .attr("cy", d => yScale(d))
                .attr("r", 8)
                .attr('fill', (d, i) => i === 0 ? "blue" : "red")
                .attr("fill-opacity", 0.5)


        const yAxisGenerator = d3.axisLeft(yScale).ticks(7).tickSize(5)
        const yAxis = bounds_avgReturn.select(".y-axis")
                            .call(yAxisGenerator)

    }

    // console.log(df_avg_returns)

    // Draw canvas - Excess returns

    const wrapper_excessReturn = d3.select("#wrapper-excessReturn")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    const bounds_excessReturn = wrapper_excessReturn.append("g")
        .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

    bounds_excessReturn.append("g")
        .attr("class", "x-axis")
        .style("transform", `translateY(${dimensions.boundedHeight})`)
    
    bounds_excessReturn.append("g")
        .attr("class", "y-axis")

    bounds_excessReturn.append("g")
        .attr("class", "pathExcessReturn")

    bounds_excessReturn.append("line")
        .attr("class", "zeroLineExcessReturn")

    const drawExcessReturns = () => {

        const yearAccessor = d => parseInt(d.fy)
        let benchmarkReturnAccessor
        if(benchmarkSelected === 'Optimal benchmark'){
            benchmarkReturnAccessor =  d => parseFloat(d.cum_opt_benchmark_excess)
        } else {
            benchmarkReturnAccessor = d => parseFloat(d.cum_custom_benchmark_excess)
        }
        // console.log(benchmarkSelected)
        // Create scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(df_cum_returns, yearAccessor))
            .range([0, dimensions.boundedWidth])
            .nice()
                
        const yScale = d3.scaleLinear()
            .domain(d3.extent(df_cum_returns, benchmarkReturnAccessor))
            .range([dimensions.boundedHeight, 0])
            .nice()

        // console.log(yScale.domain(), yScale.range())

        dataNest = Array.from(
            d3.group(df_cum_returns, d => d.plan_name), ([key, value]) => ({key, value})
        );

        const line = d3.line()
            .x(d => xScale(yearAccessor(d)))
            .y(d => yScale(benchmarkReturnAccessor(d)))


        const path_excessReturn = bounds_excessReturn.select(".pathExcessReturn").selectAll("path")
            .data(dataNest)
            .join(
                enter => enter.append("path"),
                update => update,
                exit => exit.remove()
            )
            .transition().duration(500)
            .attr("d", d => line(d.value))
            .attr("fill", "none")
            .attr("stroke", d => d.key === planSelected ? "red" : "grey")
            .attr("stroke-opacity", d => d.key === planSelected ? 1 : 0.05)

        // Draw peripherals
        const yAxisGenerator = d3.axisLeft(yScale).ticks(6)
        const yAxis = bounds_excessReturn.select(".y-axis").call(yAxisGenerator)

        const xAxisGenerator = d3.axisBottom()
                        .scale(xScale)
                        .tickFormat(d3.format(".0f"))
        const xAxis = bounds_excessReturn.select(".x-axis")
                        .call(xAxisGenerator)
                        .style("transform", `translateY(${dimensions.boundedHeight}px)`)

        bounds_excessReturn.select(".zeroLineExcessReturn").raise()
                .transition().duration(500)
                .attr("x1", xScale(xScale.domain()[0]))
                .attr("y1", yScale(0))
                .attr("x2", xScale(xScale.domain()[1]))
                .attr("y2", yScale(0))
                .style("stroke", "blue")
                .style("stroke-opacity", 0.5)
                // .style("stroke-width", 2 + 'px')

    }

    // Draw canvas - Average returns

    const avgReturn_dimensions = {
        width: dimensions.width * 2,
        height: dimensions.height * 1.5,
        margin: {
            top: 30,
            right: 20,
            bottom: 50,
            left: 50,
          },
    }

    avgReturn_dimensions.boundedWidth = avgReturn_dimensions.width - avgReturn_dimensions.margin.left - avgReturn_dimensions.margin.right
    avgReturn_dimensions.boundedHeight = avgReturn_dimensions.height - avgReturn_dimensions.margin.top - avgReturn_dimensions.margin.bottom

    const wrapper_avgExcessReturn = d3.select("#wrapper-avgExcessReturn")
        .append("svg")
        .attr("width", avgReturn_dimensions.width)
        .attr("height", avgReturn_dimensions.height)

    const bounds_avgExcessReturn = wrapper_avgExcessReturn.append("g")
        .style("transform", `translate(${avgReturn_dimensions.margin.left}px, ${avgReturn_dimensions.margin.top }px)`)

    
    bounds_avgExcessReturn.append("g")
        .attr("class", "x-axis")
        .style('transform', `translateY(${avgReturn_dimensions.boundedHeight}px)`)

    bounds_avgExcessReturn.append("g")
        .attr("class", "bubbleAvgExcessReturn")

    bounds_avgExcessReturn.append("line")
        .attr("class", "zeroLine")

    let legend = wrapper_avgExcessReturn.append("g")
        .attr("id", "legend")
        .style("transform", `translate(${avgReturn_dimensions.margin.left}px, ${avgReturn_dimensions.margin.top}px)`)

    legend.append("text")
        .attr("class", "axistitle")
        .attr("x", 100)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text("AAL")


    const tooltip = d3.select("#wrapper-avgExcessReturn")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("padding", "8px")
        .style("background-color", "#626D71")
        .style("border-radius", "6px")
        .style("text-align", "center")
        .style("font-family", "monospace")
        .style("width", "400px")
        .text("");

    const drawAvgExcessReturns = () => {

        const yearAccessor = d => parseInt(d.fy)
        const aalAccessor = d => parseFloat(d.aal)
        const percentFormat = d3.format(".2f");

        let benchmarkReturnAccessor
        if(benchmarkSelected === 'Optimal benchmark'){
            benchmarkReturnAccessor =  d => parseFloat(d.avg_opt_benchmark_excess)
        } else {
            benchmarkReturnAccessor = d => parseFloat(d.avg_custom_benchmark_excess)
        }

        const rScale = d3.scaleSqrt()
            .domain(d3.extent(df_avg_returns, aalAccessor))
            .range([0,50])

        const xScale = d3.scaleLinear()
            .domain(d3.extent(df_avg_returns, benchmarkReturnAccessor))
            // .domain([-0.15,0.1])
            .range([0, 0.9 * avgReturn_dimensions.boundedWidth])
            .nice()

        // console.log(rScale.domain())

        // Create nodes for each data points
        let nodes = df_avg_returns.map(function(d, i){
            return {
                id: "node" + i,
                x: xScale(benchmarkReturnAccessor(d)), 
                y: avgReturn_dimensions.boundedHeight / 2,
                r: rScale(aalAccessor(d)),
                rate: benchmarkReturnAccessor(d),
                cnt: aalAccessor(d),
                planName: d.plan_name,
                data: d
            }
        })


        const bubble_avgExcessReturn = bounds_avgExcessReturn.select(".bubbleAvgExcessReturn")
                .selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("id", d => "circle" + d.id)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr('fill', d => d.planName === planSelected ? "red": "grey")
                .attr('fill-opacity', d => d.planName === planSelected ? 0.5 : 0.2)
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
            .force("y", d3.forceY(avgReturn_dimensions.boundedWidth/5))
            .force("collision", d3.forceCollide().radius(d => d.r + padding))
            .alpha(.25)
            // .alphaDecay(0)

        simulation.on("tick", () => {
            bubble_avgExcessReturn.attr("cx", d => d.x)
                                .attr("cy", d => d.y)
                                .attr('fill', d => d.planName === planSelected ? "red": "grey")
        })

        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d => d + "%")
            .tickSize(8)
            .tickPadding(5)

        const xAxisEl = bounds_avgExcessReturn.select(".x-axis")
        xAxisEl.append("text")
            .attr("class", "axistitle")
            .attr("x", avgReturn_dimensions.width / 2)
            .attr("y", avgReturn_dimensions.margin.bottom - 10)
            .style("text-anchor", "middle")
            .style("fill", "grey")
            .style("fill-opacity", 1)
            .text("Average Excess Return")
        xAxisEl.call(xAxis)

        const zeroLine = bounds_avgExcessReturn.select(".zeroLine")
            .transition().duration(1000)
            .attr("x1", xScale(0))
            .attr("x2", xScale(0))
            .attr("y1", dimensions.height * 1.5 - dimensions.margin.bottom - dimensions.margin.top)
            .attr("y2", - (dimensions.height * 1.5 - dimensions.margin.bottom - dimensions.margin.top ))
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

    // Update charts with users' selection

    d3.select("select.benchmarkSelection")
        .on("change", function(e){
            benchmarkSelected = this.value
            drawCumReturns()
            drawAvgReturn()
            drawExcessReturns()
            drawAvgExcessReturns()
        })

    d3.select("select.planSelection")
        .on("change", function(e){
            e.preventDefault()
            planSelected = this.value
            drawCumReturns()
            drawAvgReturn()
            drawExcessReturns()
            drawAvgExcessReturns()
        })

    drawCumReturns()
    drawAvgReturn()
    drawExcessReturns()
    drawAvgExcessReturns()

}

draw()