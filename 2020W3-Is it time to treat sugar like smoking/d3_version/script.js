// Set chart dimensions
const w = 1000;
const h = 400;

const margins = { top: 50, left: 50, bottom: 80, right: 50, middle: 20 };

const innerWidth = w - margins.left - margins.right;
const innerHeight = h - margins.top - margins.bottom;

const showChart = document.getElementById("chartContainer");

d3.csv("../data/transformed_data_new.csv").then(data => {
  // console.log(data);
  data.forEach(d => {
    d.Category = d.Category;
    d.Age_group_years = d.Age_group_years;
    d.Year_range = d.Year_range;
    d.All = +d.All;
    d.Men = +d.Men;
    d.Women = +d.Women;
  })

  d3.selectAll("input").on("change", function() {
    const checked_val = d3.select(this).node().value;
    // console.log(checked_val);
    if (checked_val == "Children") {
      d3.select("#placeholder").remove();
      d3.select("svg").remove();
      getDropdown.selectedIndex = 0;
      horizontalBar();
    } else if(checked_val == "Adults") {
      d3.select("#placeholder").remove();
      d3.select("svg").remove();
      getDropdown.selectedIndex = 0;
      butterflyChart();
    }
  });  

  // Create a YearRange dropdown
  const yearSelection = document.getElementById("dropdownBox");

  // Create a dropdown with year ranges
  d3.select(yearSelection)
    .append("select")
      .attr("id", "yearDropdown")
      .attr("name","yearRanges")
      .selectAll("option")
      .data(d3.map(data, d => d.Year_range).keys())
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);

  const getDropdown = document.getElementById("yearDropdown");
  const defaulOption = document.createElement("option");
  defaulOption.text = "Select to continue";
  getDropdown.add(defaulOption, getDropdown[0]);
  getDropdown.selectedIndex = 0;
  getDropdown.style.backgroundColor = "#00537a";
  getDropdown.style.color = "white";


  // Align SVG to the center of the page
  d3.select("#chartContainer").attr("align", "center");

  function butterflyChart() {
    // filter adults data
    const adults_data = data.filter(d => d.Category === "Adults");
    // Get Max value for xAxis
    const xAxis_maxVal = d3.max(adults_data, d => d.All);

    // Width of each side of the pyramid
    const regionWidth = innerWidth/2 - margins.middle;
    
    // x-coordinates of y-axes
    const pointA = regionWidth;
    const pointB = innerWidth - regionWidth;    
    

    d3.select("#yearDropdown").on("change", function() {
      const yearSelected = d3.select(this).node().value;

      if (yearSelected === "Select to continue") {
        d3.select("svg").remove();
      } else {
        const getData = adults_data.filter(d => d.Year_range === yearSelected);

        // Append SVG to this DIV
        const butterflyChartDiv = document.createElement("div");      

        // Append svg to butterfly Chart DIV
        const svg = d3.select(butterflyChartDiv)
          .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("width", w)
            .attr("height", h);
        
        const mainG = svg    
          .append("g")
          .attr("transform", `translate(${margins.left}, ${margins.top})`);

        mainG
          .append("text")
          .text("Adults")
          .attr("x", innerWidth/2)
          .attr("y", -35)
          .attr("font-size", 23)
          .attr("text-anchor", "middle");    
        
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
          .domain(adults_data.map(d => d.Age_group_years))
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
          
        
        // Draw Bars
        leftBarGroup.selectAll(".bar.left")
          .data(getData)
          .enter()
          .append("rect")
            .attr("class", "bar left")
            .attr("x", xScale(0))
            .attr("y", d => yScale(d.Age_group_years))
            .attr("width", d => xScale(d.Men))
            .attr("height", yScale.bandwidth())
            .attr("fill", "#a8e6cf");

        // Add left bar labels
        mainG    
          .selectAll("leftBarLabels")
            .data(getData)
            .enter()
            .append("text")
              .attr("x", d => pointA-xScale(d.Men)+3)
              .attr("y", d => yScale(d.Age_group_years)+23)
              .attr("dy", ".5em")
              .attr("font-size", 12)
              .text(d => d.Men + "%")
              .attr("fill", "#988a8a");
            

        rightBarGroup.selectAll(".bar.right")
          .data(getData)
          .enter()
          .append("rect")
            .attr("class", "bar right")
            .attr("x", xScale(0.04))
            .attr("y", d => yScale(d.Age_group_years))
            .attr("width", d => xScale(d.Women))
            .attr("height", yScale.bandwidth())
            .attr("fill", "#fbdd7d");

        // Add right bar labels
        mainG    
        .selectAll("rightBarLabels")
          .data(getData)
          .enter()
          .append("text")
            .attr("x", d => pointB + xScale(d.Women)-33)
            .attr("y", d => yScale(d.Age_group_years)+23)
            .attr("dy", ".5em")
            .attr("font-size", 12)
            .text(d => d.Women + "%")
            .attr("fill", "#988a8a");

        // Adding x-axis label
        mainG
        .append("text")
          .attr("text-anchor", "end")
          .attr("x", innerWidth)
          .attr("y", innerHeight + margins.top)
          .text("% sugars");

        // Adding chart labels
        mainG
          .append("text")
          .attr("text-anchor", "end")
          .attr("x", 30)
          .attr("y", 0)
          .text("Men");   
      
        mainG
          .append("text")
          .attr("text-anchor", "end")
          .attr("x", innerWidth)
          .attr("y", 0)
          .text("Women");

        // Add post script
        mainG
          .append("text")
            .text("*Note: It is recommended that we consume no more than 5% of our calories from free sugars")
            .attr("x", -10)
            .attr("y", innerHeight+50)
            .attr("font-size", 12);
          
        
        // Redraw charts
 
        while(showChart.firstChild) {
          showChart.firstChild.remove();
        }
        showChart.appendChild(butterflyChartDiv);       

      } 
    }) 
  }   
    
  function horizontalBar() {
    // filter children data
    const children_data = data.filter(d => d.Category === "Children");

    // Get Max value for xAxis
    const xAxis_maxVal = d3.max(children_data, d => d.All);

    d3.select("#yearDropdown").on("change", function() {
      const yearSelected = d3.select(this).node().value;

      if (yearSelected === "Select to continue") {
        d3.select("svg").remove();
      } else {
        const getData = children_data.filter(d => d.Year_range === yearSelected);

        // Append SVG to this DIV
        const horizontalBarDiv = document.createElement("div");      

        // Append svg to horizontalBarDiv
        const svg = d3.select(horizontalBarDiv)
          .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("width", w)
            .attr("height", h);
        
        const mainG = svg    
          .append("g")
          .attr("transform", `translate(${margins.left}, ${margins.top})`);

        // Add chart title  
        mainG
          .append("text")
          .text("Children")
          .attr("x", innerWidth/2)
          .attr("y", -30)
          .attr("font-size", 23)
          .attr("text-anchor", "middle");    
        
        // Create xScale
        const xScale = d3.scaleLinear()
        .domain([0, d3.max(children_data, d => d.All)])
        .range([0, innerWidth])
        .nice();

        // Create yScale  
        const yScale = d3.scaleBand()
          .domain(children_data.map(d => d.Age_group_years))
          .range([innerHeight,0])
          .paddingInner(0.2)
          .paddingOuter(0.2)
          .align(0.5);

        // Add xAxis
        mainG
          .append("g")
          .attr("id", "xAxis")
          .attr("transform", `translate(0, ${innerHeight})`)
          .call(d3.axisBottom(xScale).tickFormat(d => d + "%"));

        // Add yAxis
        mainG
          .append("g")
          .attr("id", "yAxis")
          .call(d3.axisLeft(yScale).tickSizeInner([0]));

        // Add yAxis label
        mainG
          .append("text")
          .attr("id", "yAxis-label")
          .attr("x", -15)
          .attr("y", -5)
          // .attr("transform", "rotate(-90)")
          .attr("text-anchor", "middle")
          .text("age-group")
          .attr("font-size", 14);

        // Add xAxis label
        mainG
          .append("text")
          .attr("id", "xAxis-label")
          .attr("x", innerWidth-30)
          .attr("y", innerHeight+40)
          .text("% of sugars")
          .attr("font-size", 16);

        // Add Bars
        mainG
          .selectAll("myRect")
          .data(getData)
          .enter()
            .append("rect")
              .attr("x", xScale(0.03))
              .attr("y", d => yScale(d.Age_group_years))
              .attr("width", d => xScale(d.All))
              .attr("height", yScale.bandwidth())
              .attr("fill", "#00ced1")
            .append("text")
              .text(d => d.All)
              .attr("text-anchor", "middle")
              .attr("x", d => xScale(d.All)+5)
              .attr("y", 50)
              // .attr("fill", "white")
              .attr("font-size", "14px");

        // Add Bar labels
        mainG
          .selectAll("barLabels")
          .data(getData)
          .enter()
          .append("text")
            .attr("x", d => xScale(d.All)-33)
            .attr("y", d => yScale(d.Age_group_years)+30)
            .attr("dy", ".5em")
            .attr("font-size", 12)
            .text(d => d.All + "%")
            .attr("fill", "#988a8a");
          
        // Add threshold line      
        mainG
          .append("line")
            .attr("x1", xScale(5))
            .attr("y1", innerHeight)
            .attr("x2", xScale(5))
            .attr("y2", 0)
            .attr("stroke-width", "1px")
            .attr("stroke", "#7d8385");
      
        // Add threshold text    
        mainG
          .append("text")
            .text("5%*")
            .attr("x", xScale(5))
            .attr("y", -10)
            .attr("dx", -5)
            .attr("dy",5)
            .attr("font-size", 13)
            .attr("fill", "red");
      
        mainG
          .append("text")
            .text("*Note: It is recommended that we consume no more than 5% of our calories from free sugars")
            .attr("x", -10)
            .attr("y", innerHeight+70)
            .attr("font-size", 12);

        // Recycle charts
        while (showChart.firstChild) {
          showChart.firstChild.remove();
        }
        showChart.appendChild(horizontalBarDiv);             

      }       
    }) 
  } 


})  


