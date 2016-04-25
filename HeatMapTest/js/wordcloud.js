function wordcloud() {
  
  var linechartWidth = 400,
    wordcloudWidth = window.innerWidth - linechartWidth - 50,
    height = 300,
    wordFill = d3.scale.category20(),
    colors = ["#1f77b4",
                "#ff7f0e",
                "#2ca02c",
                "#d62728",
                "#9467bd",
                "#8c564b",
                "#e377c2",
                "#bcbd22",
                "#17becf",
                "#9edae5",
                "#aec7e8",
                "#ffbb78",
                "#98df8a",
                "#ff9896",
                "#c5b0d5",
                "#c49c94",
                "#f7b6d2",
                "#dbdb8d"],
    rotations = [-60, -30, 0, 30, 60],
    fontSizeRange = [15,50],
    character,
    episode,
    season,
    barcodeCharacters = [],
    lineChartSelection,
    g,
    multiLineChart,
    profanitiesChart = lineChart()
      .x(function(d) { return +d.season; })
      .y(function(d) { return +d.words; }),

    profanities = [],
    wordShown = {"all": true},
    secondarySelection,
    wordColors = [],
    shownWords = ["all"];

  //var episodesInSeason = [13, 18, 17, 17, 14, 17, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 10, 10];
  var seasonStarts = [1, 14, 32, 49, 66, 80, 97, 112, 126, 140, 154, 168, 182, 196, 210, 224, 238, 248, 258];

  function chart(selection) {
    selection.each(function(data) {

      //d3.select(this).selectAll("*").remove();
      var svg = d3.select(this).selectAll("svg").data([data]);

      svg.enter().append("svg").append("g");

      svg
        .attr("width", wordcloudWidth)
        .attr("height", height);

      g = svg.select("g");
      g.attr("transform", "translate(" + wordcloudWidth / 2 + "," + height / 2 + ")");

      var sizeScale = d3.scale.linear()
        .domain([1, d3.max(data, function(d) { return d.count;})])
        .range(fontSizeRange);

      if(!isEpisodeWordcloud())
        data.unshift({text:"all", count:sizeScale.domain()[1]});

      d3.layout.cloud()
          .size([wordcloudWidth, height])
          .words(data)
          .padding(5)
          .rotate(function() { return rotations[~~(Math.random() * rotations.length)]; })
          .text(function(d) { return d.text; })
          .font("Impact")
          .fontSize(function(d) { return sizeScale(d.count); })
          .on("end", draw)
          .start();
    });
  }

  function isCharacterWordcloud() {
    return character !== undefined;
  }

  function isEpisodeWordcloud() {
    return episode !== undefined;
  }

  function isSeasonWordcloud() {
    return season !== undefined;
  }

  function isWordShown(word) {
    return shownWords.indexOf(word) != -1;
  }

  function removeSecondary() {
    d3.select(secondarySelection).select("svg").remove();
    d3.select(secondarySelection).select("div").remove();
  }

  var profanityColormap = {};

  function draw(words) {
    if(isEpisodeWordcloud()) {
      shownWords = [];
      words.forEach(function(d) {
        shownWords.push(d.text);
      });
    }

    var cloud = g.selectAll(".word").data(words);

    shownWords.forEach(function(w) {
      wordShown[w] = true;
    });
    //if(wordShown == undefined)
    //  wordShown = {all: true};


    if(isEpisodeWordcloud())
      words.forEach(function(d) {
        wordShown[d.text] = true;
      });

    for(var i = 0; i < words.length; i++) {
      profanityColormap[words[i].text] = colors[i%colors.length];
    }

    //removeSecondary();
    //setTimeout(removeSecondary(), 1000);

    cloud.enter()
      .append("text")
        .attr("class", function() {
          return isCharacterWordcloud() ? "word unselected clickableText" : "word clickableText";
        })
        .style("font-size","1px")
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return colors[i % colors.length]; })
        .attr("text-anchor", "middle");

    if(isEpisodeWordcloud())
      cloud
        .on("click", function(d) {
            barcodeGraph.toggle(d.text);
            wordShown[d.text] = !wordShown[d.text];

            var index = shownWords.indexOf(d.text);
            if(index == -1)
              shownWords.push(d.text);
            else
              shownWords.splice(index, 1);

            if(isWordShown(d.text))
              d3.select(this).attr("class", "word clickableText");
            else
              d3.select(this).attr("class", "word unselected clickableText");
        });
    else
      cloud
        .on("click", lineChartWordClick);

    cloud.transition()
        .duration(1000)
        .attr("class", function(d) {
          return isWordShown(d.text)  ? "word clickableText" : "word unselected clickableText";
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

    if(isCharacterWordcloud() || isSeasonWordcloud())
      setTimeout(loadLineGraphData.bind(null, words), 1000);
    else if(isEpisodeWordcloud())
      loadBarcodeData();
  }

  function lineChartWordClick(d) {
      multiLineChart.toggle([d.text]);
      wordShown[d.text] = !wordShown[d.text];

      var index = shownWords.indexOf(d.text);
      if(index == -1)
        shownWords.push(d.text);
      else
        shownWords.splice(index, 1);

      if(isWordShown(d.text))
        d3.select(this).attr("class", "word clickableText");
      else
        d3.select(this).attr("class", "word unselected clickableText");
  }

  chart.redraw = function() {
    if(isEpisodeWordcloud())
      loadBarcodeData();
    //else if(isSeasonWordcloud())
    //  loadSeasonData();
  }

  var barcodeGraph = barcode();

  function loadBarcodeData() {
    d3.tsv("data/episode/" + episode + "_barcode.tsv",
      function(d) {
	      return {
		character: d.character,
		value: +d.value,
		profanities: +d.profanities, //TODO not needed if we got profanitiesList
		line: d.line,
		profanityList: JSON.parse(d.profanityList.replace(/'/g , '"'))
	      };
      }, function(data) {
        d3.select(secondarySelection)
          .datum(data)
          .call(
            barcodeGraph
              .profanityColormap(profanityColormap)
              .width(linechartWidth)
              .height(height)
              .characters(barcodeCharacters));
      }
    );
  }

  function loadSeasonData() {
    var start = seasonStarts[season-1],
      end = seasonStarts[season],
      nbEpisodes = end-start,
      barcodeHeight = height / nbEpisodes;

    var seasonData = [];
    var done = 0;

    //use an array to capture the value and update seasonData on the right index
    //a normal for loop would not capture the i value so the episodes would be in the wrong order
    var loopArray = [];
    for (var i = start; i < end; i++) {
       loopArray.push(i);
    }
    loopArray.forEach(function(i) {
      d3.tsv("data/episode/" + i + "_barcode.tsv",
        function(d) {
          /*return {
            character: d.Character, //TODO remove capital C in preprocessing and here
            value: +d.value
          }*/
	      return {
		character: d.character,
		value: +d.value,
		profanities: +d.profanities, //TODO not needed if we got profanitiesList
		line: d.line,
		profanityList: JSON.parse(d.profanityList.replace(/'/g , '"'))
	      };
        }, function(data) {
          seasonData[i-start] = data;
          done++;
          if(done === nbEpisodes) {
            d3.select(secondarySelection).selectAll("*").remove();
            var divs = d3.select(secondarySelection).selectAll(".barcodeChart")
              .data(loopArray)
              .enter()
              .append("div");

            divs.append("div")
              .style("width", "40px")
              .style("height", barcodeHeight + "px")
              .style("float", "left")
              .append("p")
              .text(function(d) { return mapEpisodeToNotation(d); });

            divs.data(seasonData).call(
                barcodeGraph
                  .width(linechartWidth-40)
                  .height(barcodeHeight)
                  .characters(barcodeCharacters));
          }
        }
      );
    });
  }

  function loadLineGraphData(words) {
    wordColors = [];
    var profanities = [],
      done = 0;

    var prefix = isCharacterWordcloud() ? "data/word/" + character : "data/season/" + season;
    //Load all data from the words in the line graph
    words.forEach(function(word, i) {
      d3.tsv(prefix + "_" + word.text + ".tsv", function(data) {
        wordShown[word.text] = false;
        shownWords.forEach(function(w) {
          wordShown[w] = true;
        });

        var newColumn = [word.text, null];
        data.forEach(function(v) {
          newColumn.push(v.words);
        });

        profanities[i] = newColumn;
        wordColors[i] = wordFill(word.text);
        done++;

        if(done===words.length) {
          //if(wordShown["all"] == undefined)
          //  wordShown["all"] = true;
          multiLineChart = c3.generate({
              bindto: secondarySelection,
              data: {
                columns: profanities,
                onclick: function(d) {
                  if(isCharacterWordcloud()) {
                    showSeasonInfo(d.x, d.name);
                  } else if(isSeasonWordcloud())
                    showEpisodeInfo(seasonStarts[season-1] + d.x -1);
                }
              },
              legend: {
                  show: false
              },
              color: {
                pattern: colors
              }, 
              size: {
                width: linechartWidth
              },
              axis: {
                x: {
                  min: 1,
                  label: {
                    text: isCharacterWordcloud() ? 'season' : 'episode',
                    position: 'outer-middle'
                  }
                },
                y: {
                  min: 0,
                  padding: {
                    bottom: 0
                  },
                  label: {
                    text: "occurrences per 1000 words",
                    position: 'outer-middle'
                  }
                }
              }
          });
          multiLineChart.hide();
          if(shownWords.length == 0)
            multiLineChart.show("all");
          shownWords.forEach(function(d) {
            multiLineChart.show(d);
          });
        }
      })
    });
  }

  chart.characters = function(_) {
    if (!arguments.length) return barcodeCharacters;
    barcodeCharacters = _;
    return chart;
  };

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

  chart.season = function(_) {
    if (!arguments.length) return season;
    season = _;
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

  chart.shownWords = function(_) {
    if (!arguments.length) return shownWords;
    shownWords = _;
    return chart;
  };

  return chart;

}
