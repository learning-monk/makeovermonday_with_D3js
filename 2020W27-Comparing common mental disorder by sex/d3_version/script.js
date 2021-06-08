// Set chart dimensions
const w = 1000;
const h = 500;

const margins = { top: 50, left: 50, bottom: 80, right: 50, middle: 20 };

const innerWidth = w - margins.left - margins.right;
const innerHeight = h - margins.top - margins.bottom;


d3.csv("../data/MM27MentalHealth-Transformed.csv").then(data => {
  // console.log(data);
  data.forEach(d => {
    d.Age_group = d.Age_group; 
    // d.All = +d.All;
    d.Men = +d.Men;
    d.Women = +d.Women;
  })

  // Removing last row
  data.pop();
  // console.log(data);

  // Get max value
  const xAxis_maxVal = d3.max(data, d => Math.max(d.All, d.Men, d.Women));

  // Width of each side of the pyramid
  const regionWidth = innerWidth/2 - margins.middle;
  
  // x-coordinates of y-axes
  const pointA = regionWidth;
  const pointB = innerWidth - regionWidth;    

  // Align SVG to the center of the page
  d3.select("#chartContainer").attr("align", "center");
  
  // Append svg to DIV
  const svg = d3.select("#chartContainer")
    .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("width", w)
      .attr("height", h);
    
  const mainG = svg    
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`);
 
    
  mainG
    .append("text")
    .text("Age group")
    .attr("x", innerWidth/2)
    .attr("y", -5)
    .attr("font-size", 12)
    .attr("text-anchor", "middle");      


  // Create xScale
  const xScale = d3.scaleLinear()
    .domain([0, xAxis_maxVal])
    .range([0, regionWidth])
    .nice();

  // Create xScaleLeft
  const xScaleLeft = d3.scaleLinear()
    .domain([0, xAxis_maxVal])
    .range([regionWidth, 0])
    .nice();
    
  // Create xScaleRight
  const xScaleRight = d3.scaleLinear()
    .domain([0, xAxis_maxVal])
    .range([0, regionWidth])
    .nice();  

  // Create yScale  
  const yScale = d3.scaleBand()
    .domain(data.map(d => d.Age_group))
    .range([innerHeight, 0])
    .paddingInner(0.2)
    .paddingOuter(0.2)
    .align(0.5);

  // Add LEFT xAxis
  mainG
    .append("g")
    .attr("id", "xAxis-Left")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScaleLeft).tickFormat(d => d + "%"));

  // Add RIGHT xAxis    
  mainG
    .append("g")
    .attr("id", "xAxis-Right")
    .attr("transform", `translate(${pointB}, ${innerHeight})`)
    .call(d3.axisBottom(xScaleRight).tickFormat(d => d + "%"));

  // Add LEFT yAxis  
  mainG
    .append("g")
      .attr("id", "yAxis-Right")
      .call(d3.axisRight(yScale).tickSize(4,0).tickPadding([margins.middle-40]).tickSizeInner([0]))
      .attr("transform", `translate(${pointB},0)`)
      .attr("text-align","center")
      .attr("text-anchor", "middle");
    
  // Add RIGHT yAxis
  mainG
    .append("g")
    .attr("id", "yAxis-Left")
    .call(d3.axisLeft(yScale).tickSize(4,0).tickFormat("").tickSizeInner([0]))
    .attr("transform", `translate(${pointA},0)`);

  // Create bar groups
  // scale(-1,1) is used to reverse the left side so the bars grow left instead of right
  const leftBarGroup = mainG
    .append("g")
    .attr("transform", `translate(${pointA},0)` + "scale(-1,1)");
  const rightBarGroup = mainG
    .append("g")
    .attr("transform", `translate(${pointB},0)`);
    
  
  // Draw Bars - Men
  leftBarGroup.selectAll(".bar.left")
    .data(data)
    .enter()
    .append("rect")
      .attr("class", "bar left")
      .attr("x", xScale(0))
      .attr("y", d => yScale(d.Age_group))
      .attr("width", d => xScale(d.Men))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#65708b");

  // Add left bar labels - Men
  mainG    
    .selectAll("leftBarLabels")
      .data(data)
      .enter()
      .append("text")
        .attr("x", d => pointA-xScale(d.Men)+3)
        .attr("y", d => yScale(d.Age_group)+18)
        .attr("dy", ".5em")
        .attr("font-size", 12)
        .text(d => d.Men + "%")
        .attr("fill", "white");

  // Draw Bars - Women
  rightBarGroup.selectAll(".bar.right")
    .data(data)
    .enter()
    .append("rect")
      .attr("class", "bar right")
      .attr("x", xScale(0.07))
      .attr("y", d => yScale(d.Age_group))
      .attr("width", d => xScale(d.Women))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#f9646c");  

  // Add right bar labels - Women
  mainG    
  .selectAll("rightBarLabels")
    .data(data)
    .enter()
    .append("text")
      .attr("x", d => pointB + xScale(d.Women)-32)
      .attr("y", d => yScale(d.Age_group)+18)
      .attr("dy", ".5em")
      .attr("font-size", 12)
      .text(d => d.Women + "%")
      .attr("fill", "white");
      

  // Adding chart labels
  mainG
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", margins.left)
    .attr("y", 0)
    .text("Men")
    .attr("font-size", 18);   

  mainG
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", innerWidth)
    .attr("y", 0)
    .text("Women")
    .attr("font-size", 18);      

  // Add post script
  mainG
    .append("text")
      .attr("id", "PS")
      .text("Source: NHSDigital, Mental health & Wellbeing in England, Adult Psychiatric Morbidity Survey 2014")
      .attr("x", -10)
      .attr("y", innerHeight+50)
      .attr("font-size", 12);



})  


