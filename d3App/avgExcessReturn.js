
    const wrapper_avgExcessReturn = d3.select("#wrapper-avgExcessReturn")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height * 2)

const bounds_avgExcessReturn = wrapper_avgExcessReturn.append("g")
    .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top }px)`)

// bounds_avgExcessReturn.append("g")
//     .attr("class", "x-axis")
//     .style("transform", `translateY(${dimensions.boundedHeight})`)

bounds_avgExcessReturn.append("g")
    .attr("class", "y-axis")

bounds_avgExcessReturn.append("g")
    .attr("class", "bubbleAvgExcessReturn")

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

console.log(df_avg_returns)
const drawAvgReturns = () => {

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

    const yScale = d3.scaleLinear()
        .domain(d3.extent(df_avg_returns, benchmarkReturnAccessor))
        // .domain([-3.8,2.2])
        .range([dimensions.height * 2 - dimensions.margin.top - dimensions.margin.bottom, 0])
        .nice()

    // console.log(d3.extent(df_avg_returns, d => +d.avg_custom_benchmark_excess))
    
    // Create nodes for each data points
    let nodes = df_avg_returns.map(function(d, i){
        return {
            id: "node" + i,
            x: dimensions.boundedWidth / 2,
            y: yScale(benchmarkReturnAccessor(d)),
            r: rScale(aalAccessor(d)),
            rate: benchmarkReturnAccessor(d),
            cnt: aalAccessor(d),
            planName: d.plan_name,
            data: d
        }
    })

    // console.log(nodes)
    // console.log(yScale.domain())
    const bubble_avgExcessReturn = bounds_avgExcessReturn.select(".bubbleAvgExcessReturn")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("id", d => "circle" + d.id)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr('fill', d => d.planName === planSelected ? "red": "grey")
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
        .duration(500)
        .attrTween("r", d => {
            const i = d3.interpolate(0, d.r)
            return t => d.r = i(t)
        })

    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength([-10]))
        .force("x", d3.forceX(dimensions.boundedWidth/2))
        .force("y", d3.forceY(d => yScale(d.rate)))
        .force("collision", d3.forceCollide().radius(d => d.r + padding))
        .alpha(.15)
        .alphaDecay(0)

    simulation.on("tick", () => {
        bubble_avgExcessReturn.attr("cx", d => d.x)
                            .attr("cy", d => d.y)
                            .attr('fill', d => d.planName === planSelected ? "red": "grey")
    })

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d => d + "%")
        .tickSize(8)
        .tickPadding(5)

    const yAxisEl = bounds_avgExcessReturn.select(".y-axis")
    yAxisEl.append("text")
        .attr("class", "axistitle")
        .attr("x", -yScale(1))
        .attr("y", -26)
        .attr("dx", "4px")
        .attr("dy", "-1em")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .text("Average Excess Return")
    yAxisEl.call(yAxis)