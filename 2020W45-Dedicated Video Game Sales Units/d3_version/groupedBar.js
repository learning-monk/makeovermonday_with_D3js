// Set dimensions of the chart
const w = 500;
const h = 500;

const margins = { top: 60, left: 50, bottom: 50, right: 50 };

const innerWidth = w - margins.left - margins.right;
const innerHeight = h - margins.top - margins.bottom;

d3.csv("../data/TransformedData.csv").then(data => {
  data.forEach(d => {
    d.Region = d.Region;
    d.MonthYear = d.MonthYear;
    d.Hardware = +d.Hardware;
    d.Software = +d.Software;
    d.Total = +d.Total;
  })
  
  // Groups = {"Japan","The Americas","Europe","Other"}
  const group_regions = d3.nest()
    .key(d => d.Region)
    .entries(data);
  
  // Month-Year column
  const groupKey = data.columns[1];
  
  // keys = {"Hardware","Software"}
  const keys = data.columns.slice(3);
  

  // Add an svg element for each group
  const svg = d3.select("#svgContainer")
      .selectAll("regionChart")
      .data(group_regions)
      .enter()
      .append("svg")
        .attr("width", w)
        .attr("height", h)
      .append("g")
        .attr("transform", `translate(${margins.left}, ${margins.top})`);

  // Set-up XScale
  const xScale = d3.scaleBand()
      .domain(data.map(d => d[groupKey]))
      .range([0, innerWidth])
      .paddingInner(0.2);
  
  // Set-up YScale
  const yScale = d3.scaleLinear()
      // .domain([0, d3.max(data, d => d.Total)])
      .domain([0, d3.max(data, d => d3.max(keys, key => d[key]))])
      .rangeRound([innerHeight, 0])
      .nice();

  // Add x-axis
  svg
    .append("g")
    .attr("id", "xAxis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(5));

  // Add y-axis
  svg
    .append("g")
    .attr("id", "yAxis")
    .call(d3.axisLeft(yScale));

  // Scale for subGroup position
  const xSubgroup = d3.scaleBand()
    .domain(keys)
    .range([0, xScale.bandwidth()])
    .padding([0.05]);
    

  // Color Scale
  const colorScale = d3.scaleOrdinal()
    .domain(keys)
    // .range(["#D9d2c7", "#746db3", "#B36d9a"]);
    .range(["#B36d9a", "#746db3"]);

  // Add bars
  svg
    .append("g")
    .selectAll("g")
    .data(d => d.values)
    .enter()
    .append("g")
      .attr("transform", function(d) { return "translate(" + xScale(d.MonthYear) + ",0)"; })
    .selectAll("rect")
    .data(d => keys.map(key => ({key, value: d[key]})))
    .enter()
      .append("rect")
        .attr("x", d => xSubgroup(d.key))
        .attr("y", d => yScale(d.value))
        .attr("width", xSubgroup.bandwidth())
        .attr("height", d => innerHeight - yScale(d.value))
        .attr("fill", d => colorScale(d.key))
      .append("title")
        .text(d => d.key + ": " + d.value);
  

  // Add sub-chart titles
  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("y", -5)
    .attr("x", innerWidth/2)
    .text(d => d.key)
    .style("fill", "#ff7400")
    .style("font-size", "21px");

  // Add legend
  const legend = svg
    .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${innerWidth+50},-40)`)
      .attr("text-anchor", "end")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
    .selectAll("g")
    .data(keys)
    .enter()
    .append("g")
      .attr("transform", (d,i) => `translate(0, ${i*15})`);

  legend
    .append("rect")
      .attr("x", -19)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colorScale);

  legend
    .append("text")
      .attr("y", 4.5)
      .attr("x", -23)    
      .attr("dy", "0.35em")
      .text(d => d);

       

});