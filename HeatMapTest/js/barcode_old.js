function barcode() {

  var margin = {top: 20, right: 20, bottom: 70, left: 40},
      width = 600,
      height = 200,
      barHeight = 50,
      barcodeDistance = 15,
      tHeight = 3,
      tWidth = 2
      colormap = {},
      specificColors = { "Cartman":"#C11B17" 
  		, "Kenny": "#ff6633" ,  "Kyle" : "#00cc33" ,  "Stan": "#0041C2"
      , "Chef": "#6F4E37", "Wendy" : "#fd86e1", "Bebe": "#cc0066", "Randy": "#48CCCD"
      , "Butters": "#E4ED61", "Mr. Garrison": "#AAAAAA"}
      otherColors = ["#004F19", "#FFFF00", "#ff9896", "#98df8a", "#9467bd", "#dbdb8d", "#fdd0a2", "#636363"],
      barcodeCharacters = [];


  //ik denk niet dat dit zelfs nog gebruikt wordt
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
  var y = d3.scale.linear().range([height, 0]);

  //array met totalwords per episode, wordt hierbeneden aangevuld
  var totalWords, 
    cumul;  //array die per episode laatste xpos bijhoudt. Begint bij 50 >> linkermarge
                //array is even groot als aantal episodes
                              //vul array met 50
    
  //hooverding, boven bij tooltip layout aanpassen
  var barcodeTooltip = d3.select("body").append("div")
      .attr("class", "barcodeTooltip")
      .style("opacity", 0);

  var gEnter;

  function chart(selection) {
    selection.each(function(data) {
      if(barHeight > height - tHeight)
        barHeight = height - tHeight;
      totalWords = 0;
      cumul = 10;
      data.forEach(function(d) {
          totalWords = totalWords + Math.abs(d.value);
      });

      colormap = {"Other": "#f1f1ee"};
      barcodeCharacters.forEach(function(d) {
        var i = 0;
        if(d in specificColors)
          colormap[d] = specificColors[d]
        else {
          colormap[d] = otherColors[i];
          i++;
        }
      });

      d3.select(this).selectAll("svg").remove();
      var svg = d3.select(this).selectAll("svg").data([data]);

      svg.selectAll("bar").remove();
      gEnter = svg.enter().append("svg").append("g");

      svg
        .attr("width", width)
        .attr("height", height);

      gEnter.selectAll("bar")
          .data(data)
          .enter().append("rect")
          .style("fill", color)  //allemaal met bovenstaande functies
          .attr("x", xPos)  
          .attr("y", height/2 - barHeight/2)  
          .attr("width", function(d){ return scaleBarWidth(d);})
          .attr("height", barHeight)

          .on("mouseover", function(d) { //hooverding 
              barcodeTooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              barcodeTooltip.html(d.character + ": " + d.value)
                   .style("left", (d3.event.pageX - 30) + "px")
                   .style("top", (d3.event.pageY - 20) + "px");
                   //.style("fontsize", 8px);
          })
          .on("mouseout", function(d) {
              barcodeTooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

    });
  }


  //kleur van balkje
  function color(d){
    if(d.character in colormap)
      return colormap[d.character];
    else
      return colormap["Other"];
  }

  //breedte voor balkje
  function scaleBarWidth(d) {
    var w = d.value;
    if(w<0) { w = -w;}
    return (w*(width-20)/totalWords);
  }

  //xpos voor balkje (mssn niet de beste manier om uit te rekenen)
  ////xpositie van volgende is xpositie van vorige plus de breedte van vorige
  function xPos(x){
  	temp = cumul; 
  	cumul = temp + scaleBarWidth(x); 
  	//OPTIMALISEER HIER die width wordt twee keer uitgerekend. Eens hier en eens bij width
    if(x.value<0) {drawTriangle(x, temp+scaleBarWidth(x)/2);}
  	return temp; 
  }



  function drawTriangle(d, x_pos){
    var seasonOffset = 0,
      spacing = 40,
      y_pos = height/2 - barHeight/2;

    var trianglePoints = x_pos + ' '             + y_pos + ', ' 
                      + (x_pos - tWidth)  + ' ' + (y_pos - tHeight) + ', ' 
                      + (x_pos + tWidth ) + ' ' + (y_pos - tHeight )+ ', ' 
                      + x_pos + ' '              + y_pos;

    gEnter.append('polyline')
        .attr('points', trianglePoints)
        .style('stroke', colormap[d.character])
        .style('fill', colormap[d.character])
        .on("mouseover", function(d) { //hooverding 
            tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
            tooltip.html(d.character + ": " + d.value)
                 .style("left", (d3.event.pageX - 30) + "px")
                 .style("top", (d3.event.pageY - 20) + "px");
                 //.style("fontsize", 8px);
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
        });
  }

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.characters = function(_) {
    if (!arguments.length) return barcodeCharacters;
    barcodeCharacters = _;
    return chart;
  };

  return chart;

}