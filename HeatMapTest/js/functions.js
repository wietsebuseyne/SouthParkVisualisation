function mapEpisodeSeasonEpisode(episode) {
  for(var season = 0; season < seasonMap.length; season++) {
    if(episode <= seasonMap[season][1]) {
      return [season+1, episode];
    }
    episode -= seasonMap[season][1];
  }
  return [0,0];
}

function mapEpisodeToNotation(episode) {
  var result = mapEpisodeSeasonEpisode(episode);
  return "S" + result[0] + "E" + result[1];
}
  
function getSeasonLabelData() {
    var startSeason = mapEpisodeSeasonEpisode(startEpisode)[0],
      endSeason = mapEpisodeSeasonEpisode(startEpisode+shownEpisodes)[0];
    var seasonInfoData = [];
    var sizeFirstSeason = seasonMap[startSeason-1][1] - mapEpisodeSeasonEpisode(startEpisode)[1];
    if(sizeFirstSeason > 4)
      seasonInfoData.push({
        season: startSeason, 
        size: sizeFirstSeason,
        x: 0
      });
    var seasonStartX = sizeFirstSeason;
    for(var i = startSeason+1; i < endSeason; i++) {
      seasonInfoData.push({season:i, size: seasonMap[i-1][1], x: seasonStartX});
      seasonStartX += seasonMap[i-1][1];
    }
    seasonInfoData.push({
      season: endSeason,
      x: seasonStartX
    });
    return seasonInfoData;
  }