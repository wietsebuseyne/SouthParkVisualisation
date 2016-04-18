function wordcloud() {
  
  var linechartWidth = 400,
    wordcloudWidth = window.innerWidth - linechartWidth - 50,
    height = 300,
    wordFill = d3.scale.category20(),
    rotations = [-60, -30, 0, 30, 60],
    fontSizeRange = [15,50],
    character,
    episode,
    lineChartSelection,
    g,
    multiLineChart,
    profanitiesChart = lineChart()
      .x(function(d) { return +d.season; })
      .y(function(d) { return +d.words; }),

    profanities = [],
    wordShown = {},
    secondarySelection;

  function chart(selection) {
    selection.each(function(data) {

      var svg = d3.select(this).selectAll("svg").data([data]);

      var gEnter = svg.enter().append("svg").append("g");

      svg
        .attr("width", wordcloudWidth)
        .attr("height", height);

      g = svg.select("g");
      g.attr("transform", "translate(" + wordcloudWidth / 2 + "," + height / 2 + ")");

      var sizeScale = d3.scale.linear()
        .domain([1, d3.max(data, function(d) { return d.count;})])
        .range(fontSizeRange);

      data.unshift({text:"all", count:sizeScale.domain()[1]});

      d3.layout.cloud()
          .size([wordcloudWidth, height])
          .words(data)
          .padding(5)
          .rotate(function() { return rotations[~~(Math.random() * rotations.length)]; })
          .font("SouthParkFont")
          .fontSize(function(d) { return sizeScale(d.count); })
          .on("end", draw)
          .start();
    });
  }

  var wordColors = [];

  function isCharacterWordcloud() {
    return character !== undefined;
  }

  function isEpisodeWordcloud() {
    return episode !== undefined;
  }

  function removeSecondary() {
    d3.select(secondarySelection).select("svg").remove();
    d3.select(secondarySelection).select("div").remove();
  }

  function draw(words) {
    var cloud = g.selectAll(".word").data(words);
    wordShown = {all: true};

    removeSecondary();
    setTimeout(removeSecondary(), 1000);

    cloud.enter()
      .append("text")
        .attr("class", function() {
          return isCharacterWordcloud() ? "word unselected" : "word";
        })
        .style("font-size","1px")
        .style("font-family", "SouthParkFont")
        .style("fill", function(d) { return wordFill(d.text); })
        .attr("text-anchor", "middle")
        .on("click", function(d) {
          multiLineChart.toggle([d.text]);
          wordShown[d.text] = !wordShown[d.text];
          if(wordShown[d.text])
            d3.select(this).attr("class", "word");
          else
            d3.select(this).attr("class", "word unselected");
        });
      cloud.transition()
          .duration(1000)
          .attr("class", function(d) {
            return isCharacterWordcloud() && !wordShown[d.text] ? "word unselected" : "word";
          })
          .style("font-size",function(d) { return d.size + "px"; })
          .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });

      //Exiting words
      cloud.exit()
          .transition()
              .duration(500)
              .style('fill-opacity', 1e-6)
              .style("font-size", "1px")
          .remove();

    if(isCharacterWordcloud())
      setTimeout(loadLineGraphData.bind(null, words), 1000);
    //if(isEpisodeWordcloud())
    //  setTimeout(loadBarCodeData, 1000);
  }

  var barcodeGraph = barcode();

  function loadBarCodeData() {
    d3.tsv("data/episode/" + episode + "_barcode.tsv",
      function(d) {
        return {
          episode: +d.episode,
          character: d.character,
          value: +d.value
        }
      }, function(data) {
        d3.select(secondarySelection)
          .datum(data)
          .call(barcodeGraph.width(linechartWidth).height(height));
      }
    );
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
              bindto: secondarySelection,
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
                width: linechartWidth
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

  chart.episode = function(_) {
    if (!arguments.length) return episode;
    episode = _;
    return chart;
  };

  chart.linechartWidth = function(_) {
    if (!arguments.length) return linechartWidth;
    linechartWidth = _;
    wordcloudWidth = window.innerWidth - linechartWidth - 50;
    return chart;
  };

  chart.wordcloudWidth = function(_) {
    if (!arguments.length) return wordcloudWidth;
    wordcloudWidth = _;
    linechartWidth = window.innerWidth - wordcloudWidth - 50;
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

  chart.secondarySelection = function(_) {
    if (!arguments.length) return secondarySelection;
    secondarySelection = _;
    return chart;
  };

  return chart;

}