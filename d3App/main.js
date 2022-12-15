
import {drawCumReturns_} from './modules/cumReturn.js'
import {drawAvgReturn_} from './modules/avgReturn.js'
import {drawExcessReturn_} from './modules/excessReturn.js'
import {drawAvgExcessReturn_} from './modules/avgExcessReturn.js'

async function draw(){

    // 1. Access data
    const df_avg_returns = await d3.csv("../ppd_avg_returns_final.csv")
    const df_cum_returns = await d3.csv("../ppd_cum_returns.csv")

    const defaultPlan = "Alabama ERS"
    const defaultBenchmarkType = "Optimal benchmark"

    let allPlanNames = new Array()
    df_avg_returns.forEach(d => allPlanNames.push(d.plan_name))

    const periodSelection = ['10 years', '15 years', '20 years']
    const benchmarkTypeSelection = [
        'Optimal benchmark',
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

    userSelection.select("#planSelection")
        .selectAll("option")
        .data(allPlanNames)
        .join("option")
        .text(d => d)
        .attr("value", d => d)

    userSelection.select("#benchmarkSelection")
        .selectAll("option")
        .data(benchmarkTypeSelection)
        .join("option")
        .text(d => d)
        .attr("value", d => d)

    userSelection.select("#periodSelection")
        .selectAll("option")
        .data(periodSelection)
        .join("option")
        .text(d => d)
        .attr("value", d => d)

    // Initial options
    let planSelected = d3.select("#planSelection").property("value")
    let benchmarkSelected = d3.select("#benchmarkSelection").property("value")

    // Draw the frame of the cummulative return chart

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
        .join('circle')
        .attr("cx", dimensions.boundedWidth * 0.1)
        .attr("cy", (d,i) => dimensions.boundedHeight * (i+1)/10)
        .attr("r", 4)
        .style("fill", d => colorScale(d))

    const labelText = bounds_cummulativeReturn.append("g")
            .attr("class", "labeltext")

    labelText.selectAll("circle")
        .data(labels)
        .join('text')
        .attr("x", dimensions.boundedWidth * 0.15)
        .attr("y", (d,i) => dimensions.boundedHeight * (i+1)/9)
        .style("fill", "black")
        .text(d => d)

    // Draw the frame of the average return chart

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



    // Draw the frame of the excess return chart

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

    // }

    // Draw the frame of the average excess return chart

    const avgReturn_dimensions = {
        width: dimensions.width * 2,
        height: dimensions.height * 1.5,
        margin: {
            top: 30,
            right: 20,
            bottom: 50,
            left: 50,
          },
          padding: 1
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


    // Update charts with users' selection

    d3.select("#benchmarkSelection")
        .on("change", function(e){
            benchmarkSelected = this.value
            drawCumReturns_(df_cum_returns, dimensions, planSelected, benchmarkSelected, bounds_cummulativeReturn)
            drawAvgReturn_(df_avg_returns, dimensions, planSelected, benchmarkSelected, bounds_avgReturn)
            drawExcessReturn_(df_cum_returns, dimensions, planSelected, benchmarkSelected, bounds_excessReturn)
            drawAvgExcessReturn_(df_avg_returns, avgReturn_dimensions, planSelected, benchmarkSelected, bounds_avgExcessReturn, legend, tooltip)
        })

    d3.select("#planSelection")
        .on("change", function(e){
            e.preventDefault()
            planSelected = this.value
            drawCumReturns_(df_cum_returns, dimensions, planSelected, benchmarkSelected, bounds_cummulativeReturn)
            drawAvgReturn_(df_avg_returns, dimensions, planSelected, benchmarkSelected, bounds_avgReturn)
            drawExcessReturn_(df_cum_returns, dimensions, planSelected, benchmarkSelected, bounds_excessReturn)
            drawAvgExcessReturn_(df_avg_returns, avgReturn_dimensions, planSelected, benchmarkSelected, bounds_avgExcessReturn, legend, tooltip)
        })

    drawCumReturns_(df_cum_returns, dimensions, planSelected, benchmarkSelected, bounds_cummulativeReturn)
    drawAvgReturn_(df_avg_returns, dimensions, planSelected, benchmarkSelected, bounds_avgReturn)
    drawExcessReturn_(df_cum_returns, dimensions, planSelected, benchmarkSelected, bounds_excessReturn)
    drawAvgExcessReturn_(df_avg_returns, avgReturn_dimensions, planSelected, benchmarkSelected, bounds_avgExcessReturn, legend, tooltip)

    

}

draw()
