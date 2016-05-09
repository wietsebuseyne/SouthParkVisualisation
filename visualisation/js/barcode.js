function barcode() {

  var margin = {top: 10, right: 10, bottom: 0, left: 10},
      width = 600,
      barHeight = 50,
      barcodeDistance = 15,
      tHeight = 5,
      tWidth = 3,
      colormap = {},
      profanityColormap = {},
      excluded_profanities = [],
      specificColors = { "Cartman":"#C11B17"
  		, "Kenny": "#ff6633" ,  "Kyle" : "#00cc33" ,  "Stan": "#0041C2"
      , "Chef": "#6F4E37", "Wendy" : "#fd86e1", "Randy": "#48CCCD"
      , "Butters": "#E4ED61", "Mr. Garrison": "#AAAAAA"}
      otherColors = ["#FFFF00", "#cc0066", "#ff9896", "#98df8a", "#004F19", "#9467bd", "#dbdb8d", "#fdd0a2", "#636363"],
      barcodeCharacters = [];


  //ik denk niet dat dit zelfs nog gebruikt wordt
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
  var y = d3.scale.linear().range([height, 0]);
  var characterLegendWidth = 100;

  //array met totalwords per episode, wordt hierbeneden aangevuld
  var totalWords, cumul;

  //hooverding, boven bij tooltip layout aanpassen
  var barcodeTooltip;

  var gEnter;

  var selection;

  function chart(s) {
    selection = s;
    excluded_profanities = [];
    redraw();
  }

  function redraw() {
    selection.each(function(data) {
      height = barHeight + tHeight + margin.top + margin.bottom;
      totalWords = 0;
      cumul = margin.left;
      data.forEach(function(d) {
          totalWords = totalWords + d.value;
      });

      colormap = {"Other": "#f1f1ee"};
      var i = 0;
      barcodeCharacters.forEach(function(d) {
        if(d in specificColors)
          colormap[d] = specificColors[d]
        else {
          colormap[d] = otherColors[i%otherColors.length];
          i++;
        }
      });

      d3.select(this).selectAll(".barcodeLegend").remove();
      barcodeLegend = d3.select(this).selectAll(".barcodeLegend")
        .data(barcodeCharacters)
        .enter().append("span")
          .attr("class", "barcodeLegend")
          .html(function (d) { if(d=="All") return ""; else return " " + d + " "; })
          .attr("style", function (d) { if(d=="All") return ""; else return "padding: 0px 5px; display: inline-block;";})
          .each(function (d) {
            d3.select(this).style('background-color', colormap[d]);
          });
      d3.select(this).append("br").attr("class", "barcodeLegend");

      d3.select(this).selectAll("svg").remove();
      var svg = d3.select(this).selectAll("svg").data([data]);


      svg.selectAll("bar").remove();
      gEnter = svg.enter().append("svg").append("g");

      svg
        .attr("width", width-margin.left-margin.right)
        .attr("height", height);

      gEnter.selectAll("bar")
          .data(data)
          .enter().append("rect")
          .attr("class", "bar")
          .style("fill", color)  //allemaal met bovenstaande functies
          .attr("x", xPos)
          .attr("y", margin.top)
          .attr("width", function(d){ return scaleBarWidth(d);})
          .attr("height", barHeight)

          .on("mouseover", function(d) { //hooverding
              barcodeTooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              barcodeTooltip.html("<b>" + d.character + '</b>: "' + d.line + '"');
          })
          .on("mouseout", function(d) {
              barcodeTooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
              barcodeTooltip.html("");
          });

      d3.select("#barcodeTooltip").remove();
      barcodeTooltip = d3.select("#episodeBarchart").append("div")
        .attr("id", "barcodeTooltip");
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
    return (d.value*(width-margin.left-margin.right)/(totalWords*1.1));
  }

  //xpos voor balkje (mssn niet de beste manier om uit te rekenen)
  //xpositie van volgende is xpositie van vorige plus de breedte van vorige
  function xPos(d){
  	temp = cumul;
  	cumul = temp + scaleBarWidth(d);
  	//OPTIMALISEER HIER die width wordt twee keer uitgerekend. Eens hier en eens bij width
    if(d.profanities > 0)
    for(var i = 0; i < d.profanities; i++)
      if(excluded_profanities.indexOf(d.profanityList[i]) == -1)
      	drawTriangle(profanityColormap[d.profanityList[i]],
        	temp+(i+1)*scaleBarWidth(d)/(d.profanities+1));
    return temp;
  }

  function drawTriangle(color, x_pos){
    var seasonOffset = 0,
      spacing = 40,
      y_pos = margin.top;

    var trianglePoints = x_pos + ' '             + y_pos + ', '
                      + (x_pos - tWidth)  + ' ' + (y_pos - tHeight) + ', '
                      + (x_pos + tWidth ) + ' ' + (y_pos - tHeight )+ ', '
                      + x_pos + ' '              + y_pos;

    gEnter.append('polyline')
        .attr('points', trianglePoints)
        .style('fill', color);
  }

  chart.toggle = function(word) {
    var index = excluded_profanities.indexOf(word);
    if(index == -1)
      excluded_profanities.push(word);
    else
      excluded_profanities.splice(index, 1);
    redraw();
    return chart;
  }

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return barHeight + tHeight + margin.top + margin.bottom;
    barHeight = _ - margin.top - margin.bottom - tHeight;
    return chart;
  };

  chart.characters = function(_) {
    if (!arguments.length) return barcodeCharacters;
    barcodeCharacters = _;
    return chart;
  };

  chart.profanityColormap = function(_) {
    if (!arguments.length) return profanityColormap;
    profanityColormap = _;
    return chart;
  };

  return chart;

}
