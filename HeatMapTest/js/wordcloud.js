function wordcloud() {
  
  var width = 550,
    height = 400,
    wordFill = d3.scale.category20(),
    rotations = [-60, -30, 0, 30, 60],
    fontSizeRange = [15,50],
    character,
    lineChartSelection,
    g,
    multiLineChart,
    profanitiesChart = lineChart()
      .x(function(d) { return +d.season; })
      .y(function(d) { return +d.words; }),
    /*profanities = [{s:1}, {s:2}, {s:3}, {s:4}, {s:5}, {s:6}, {s:7}, {s:8},
      {s:9}, {s:10}, {s:11}, {s:12}, {s:13}, {s:14}, {s:15}, {s:16}, {s:17}, {s:18}];*/
    profanities = [],
    wordShown = {};

  function chart(selection) {
    selection.each(function(data) {

      var svg = d3.select(this).selectAll("svg").data([data]);

      var gEnter = svg.enter().append("svg").append("g");

      svg
        .attr("width", width)
        .attr("height", height);

      g = svg.select("g");
      g.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var sizeScale = d3.scale.linear()
        .domain([1, d3.max(data, function(d) { return d.count;})])
        .range(fontSizeRange);

      data.unshift({text:"all", count:sizeScale.domain()[1]});

      d3.layout.cloud()
          .size([width, height])
          .words(data)
          .padding(5)
          .rotate(function() { return rotations[~~(Math.random() * rotations.length)]; })
          .font("Impact")
          .fontSize(function(d) { return sizeScale(d.count); })
          .on("end", draw)
          .start();
    });
  }

  var wordColors = [];

  function draw(words) {
    var cloud = g.selectAll(".word").data(words);

    d3.select("#lineChart").select("svg").remove();
    wordShown = {all: true};

    cloud.enter()
      .append("text")
        .attr("class", "word clickableText")
        .style("font-size", 1)
        .style("font-family", "Impact")
        .style("stroke", "black")
        .style("stroke-width", 0)
        .style("fill", function(d) { return wordFill(d.text); })
        .attr("text-anchor", "middle")
        .on("click", function(d) {
          multiLineChart.toggle([d.text]);
          wordShown[d.text] = !wordShown[d.text];
          if(wordShown[d.text])
            d3.select(this).style("stroke-width", d.size/20);
          else
            d3.select(this).style("stroke-width", 0);

          /*d3.tsv("data/word/" + character + "_" + d.text + ".tsv", function(data) {
            var newColumn = [d.text];
            data.forEach(function(v) {
              newColumn.push(v.words);
            });
            profanities.push(newColumn);
            var chart = c3.generate({
                bindto: '#multiLineChart',
                data: {
                  columns: profanities
                },
                axis: {
                  x: {
                    label: {
                      text: 'season',
                      position: 'outer-middle'
                    }
                  }
                }
            });

            //Multiple lines 1
            /*data.forEach(function(v, i) {
              profanities[v.season-1][d.text] = v.words;
            });
            var labels = {};
            d3.keys(profanities[0]).filter(function(key) { return key !== "s"; }).forEach(function(name) {
              labels[name] = {column: name};
            });
            console.log(labels);
            var c = multiLineChart(profanities, "s", labels, {xAxis: 'Season', yAxis: 'Count'});
            c.bind("#lineChart");
            c.render();*/
            //Single line:
            /*d3.select("#lineChart")
              .datum(data)
              .call(profanitiesChart.word(d.text));*/


          /*});*/
        });

    cloud.transition()
        .duration(1000)
        .style("stroke-width", function(d) {
          if(wordShown[d.text])
            return d.size/20;
          else
            return 0;
        })
        .attr('font-size', function(d) { return d.size; })
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });

    //Exiting words
    cloud.exit()
        .transition()
            .duration(500)
            .style('fill-opacity', 1e-6)
            .attr('font-size', 1)
        .remove();

    setTimeout(loadLineGraphData.bind(null, words), 1000);
  }

  function loadLineGraphData(words) {
    wordColors = [];
    var profanities = [],
      done = 0;

    //Load all data from the words in the line graph
    words.forEach(function(word, i) {
      d3.tsv("data/word/" + character + "_" + word.text + ".tsv", function(data) {
        wordShown[word.text] = false;
        var newColumn = [word.text, null];
        data.forEach(function(v) {
          newColumn.push(v.words);
        });

        profanities[i] = newColumn;
        wordColors[i] = wordFill(word.text);
        done++;

        if(done===words.length) {
          wordShown["all"] = true;
          multiLineChart = c3.generate({
              bindto: '#characterLineChart',
              data: {
                columns: profanities
              },
              legend: {
                  show: false
              },
              color: {
                pattern: wordFill.range()
              }, 
              size: {
                width: width
              },
              axis: {
                x: {
                  min: 1,
                  label: {
                    text: 'season',
                    position: 'outer-middle'
                  }
                },
                y: {
                  min: 0,
                  padding: {
                    bottom: 0
                  }
                }
              }
          });
          multiLineChart.hide();
          multiLineChart.show("all");
        }
      })
    });
  }

  chart.character = function(_) {
    if (!arguments.length) return character;
    character = _;
    return chart;
  };

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

  chart.rotations = function(_) {
    if (!arguments.length) return rotations;
    rotations = _;
    return chart;
  };

  chart.fontSizeRange = function(_) {
    if (!arguments.length) return fontSizeRange;
    fontSizeRange = _;
    return chart;
  };

  return chart;

}