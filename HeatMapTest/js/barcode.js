function barcode() {

  var margin = {top: 20, right: 20, bottom: 70, left: 40},
      width = 600,
      height = 200,
      barHeight = 50,
      barcodeDistance = 15,
      nbOfEpisodes = 1,
      colormap =  { "Cartman":"#C11B17" 
  		, "Kenny": "#ff6633" ,  "Kyle" : "#00cc33" ,  "Stan": "#0041C2"
      , "Chef": "#6F4E37", "Mr. Garrison" : "#BCC6CC", "Wendy" : "#fd86e1", "Randy" :"#48CCCD"
      , "Butters": "#E4ED61", "Craig":"#f1f1ee", "Clyde": "#f1f1ee","Other": "#f1f1ee"};


  //ik denk niet dat dit zelfs nog gebruikt wordt
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
  var y = d3.scale.linear().range([height, 0]);

  //array met totalwords per episode, wordt hierbeneden aangevuld
  var totalWords = Array.apply(null, Array(nbOfEpisodes)).map(Number.prototype.valueOf,0);
    
  //hooverding, boven bij tooltip layout aanpassen
  /*var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);*/

  var svg;

  function chart(selection) {
    selection.each(function(data) {
      data.forEach(function(d) {
          totalWords[d.episode-1] = totalWords[d.episode-1] + d.value;
      });
      svg = d3.select(this).append("svg")
          .attr("width", width)// + margin.left + margin.right)
          .attr("height", height)// + margin.top + margin.bottom)
          .append("g");
          //.attr("transform", 
          //      "translate(" + margin.left + "," + margin.top + ")");


    //data: episode, character, value
    //maak nummers van strings en tel total words per episode
    //OPTIMALISEER door total nb of words in tsv zetten?
    /*d3.tsv("season-all.tsv", function(error, data) {
      data.forEach(function(d) {
          d.value = +d.value;
          d.episode = +d.episode;
          totalWords[d.episode-1] = totalWords[d.episode-1] + d.value;
      });*/

    svg.selectAll("bar")
          .data(data)
          .enter().append("rect")
          .style("fill", color)  //allemaal met bovenstaande functies
          .attr("x", xPos)  
          .attr("y", height/2 - barHeight/2)  
          .attr("width", function(d){ return scaleBarWidth(d);})
          .attr("height", barHeight)

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

    });
  }


  //kleur van balkje
  function color(d){
    return colormap[d.character];
  }

  //breedte voor balkje
  function scaleBarWidth(x) {
    var w = x.value;
    if(w<0) { w = -w;}
    return (w*width/(totalWords[x.episode - 1]));
  }

  //array die per episode laatste xpos bijhoudt. Begint bij 50 >> linkermarge
  							//array is even groot als aantal episodes
  														//vul array met 50
  var cumul = Array.apply(null, Array(nbOfEpisodes)).map(Number.prototype.valueOf, 50);


  //xpos voor balkje (mssn niet de beste manier om uit te rekenen)
  ////xpositie van volgende is xpositie van vorige plus de breedte van vorige
  function xPos(x){
  	temp = cumul[x.episode - 1]; 
  	cumul[x.episode -1] = temp + scaleBarWidth(x); 
  	//OPTIMALISEER HIER die width wordt twee keer uitgerekend. Eens hier en eens bij width
    if(x.value<0) {drawTriangle(x, temp);}
  	return temp; 
  }



  function drawTriangle(d, x_pos){
    seasonOffset = 0
    spacing = 40
    if(d.episode > 13){seasonOffset = seasonOffset + spacing}
    if(d.episode > 31){seasonOffset = seasonOffset + spacing}
    if(d.episode > 48){seasonOffset = seasonOffset + spacing}
    if(d.episode > 65){seasonOffset = seasonOffset + spacing}
    if(d.episode > 79){seasonOffset = seasonOffset + spacing}
    if(d.episode > 96){seasonOffset = seasonOffset + spacing}
    if(d.episode > 111){seasonOffset = seasonOffset + spacing}
    if(d.episode > 125){seasonOffset = seasonOffset + spacing}
    if(d.episode > 139){seasonOffset = seasonOffset + spacing}
    if(d.episode > 153){seasonOffset = seasonOffset + spacing}
    if(d.episode > 167){seasonOffset = seasonOffset + spacing}
    if(d.episode > 181){seasonOffset = seasonOffset + spacing}
    if(d.episode > 195){seasonOffset = seasonOffset + spacing}
    if(d.episode > 209){seasonOffset = seasonOffset + spacing}
    if(d.episode > 223){seasonOffset = seasonOffset + spacing}
    if(d.episode > 237){seasonOffset = seasonOffset + spacing}
    if(d.episode > 247){seasonOffset = seasonOffset + spacing}


    y_pos = height/2 - barHeight/2;
    tHeight = 3;
    tWidth = 2;

    var trianglePoints = x_pos + ' '             + y_pos + ', ' 
                      + (x_pos - tWidth)  + ' ' + (y_pos - tHeight) + ', ' 
                      + (x_pos + tWidth ) + ' ' + (y_pos - tHeight )+ ', ' 
                      + x_pos + ' '              + y_pos;

    svg.append('polyline')
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

  return chart;

}