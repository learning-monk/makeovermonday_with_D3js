// Set dimensions and margins of the chart
const width = 800;
const height = 550;

const margins = { top: 80, right: 100, bottom: 100, left: 150};

const innerWidth = width - margins.left - margins.right;
const innerHeight = height - margins.top - margins.bottom;


// Read data
d3.csv("../data/Global_import_of_cocoa_beans_transformed.csv").then(data => {

  data.forEach(d => {
    d.Year = d.Year;
    d.Americas = +d.Americas;
    d["Asia & Oceania"] = +d["Asia & Oceania"];
    d.Europe = +d.Europe;
  })

  const regions = [data.columns[1], data.columns[2], data.columns[3]];

  // Get arrays of {x,y} tuples
  const formatted_data = regions.map(function(region) {
    return {
      name: region,
      values: data.map(function(d) {
        return {
          Year: d.Year,
          value: +d[region]
        }
      })
    }  
  });


  // Set color scale. One color per group
  const colorScale = d3.scaleOrdinal()
                      .domain(regions)
                      .range(d3.schemeSet2);

  // Set up xScale
  const xScale = d3.scaleLinear()
                  .domain(d3.extent(data, d => d.Year))
                  .rangeRound([0, innerWidth]);
  
                                                        
  // Set up yScale
  const yScale = d3.scaleLinear()
                  .domain([d3.min(data, d => Math.min(d.Americas, d["Asia & Oceania"], d.Europe)), d3.max(data, d => Math.max(d.Americas, d["Asia & Oceania"], d.Europe))])
                  .rangeRound([innerHeight, 0])
                  .nice();
 
  // Append svg object to the div container
  const svg = d3.select("#svg-container")
  .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("width", width)
    .attr("height", height);

  const mainG = svg.append("g")
                  .attr("transform", `translate(${margins.left}, ${margins.top})`);

  // Add x-axis
  mainG
  .append("g")
    .attr("id", "xAxis")
    .call(d3.axisBottom(xScale).tickFormat(d3.format(".0f")).tickValues(d3.range(d3.min(data, d => d.Year),d3.max(data, d => d.Year)+1,1)))
    .attr("transform", `translate(0, ${innerHeight})`);

  // Add y-axis
  mainG
  .append("g")
    .attr("id", "yAxis")
    .call(d3.axisLeft(yScale));
    
  // Add lines
  const line = d3.line()
    .x(d => xScale(d.Year))
    .y(d => yScale(d.value))

  mainG.selectAll("myLines")
    .data(formatted_data)
    .enter()
    .append("path")
      .attr("d", d => line(d.values))
      .attr("stroke", d => colorScale(d.name))
      .style("stroke-width", 2)
      .style("fill", "none")  


  // Add Points
  mainG.selectAll("myDots")
    .data(formatted_data)
    .enter()
      .append("g")
      .style("fill", d => colorScale(d.name))
    .selectAll("myPoints")
      .data(d => d.values)
      .enter()
      .append("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.value))
        .attr("r", 5)
        .attr("stroke", "none")

  // Add line labels
  mainG.selectAll("lineLabels")
    .data(formatted_data)
    .enter()
      .append("g")
      .append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length-1]} })
        .attr("transform", function(d) { return "translate(" + (xScale(d.value.Year)+6) + "," + (yScale(d.value.value)+5) + ")"; })
        .text(d => d.name)
        .style("fill", d => colorScale(d.name))
        .style("font-size", 14);

});