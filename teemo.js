const summonerDTOTemplate = document.querySelector('[summoner-summonerDTO-template]');
const summonerDTOContainer = document.querySelector('[search-summonerDTO-container]');

const summonerLegendTemplate = document.querySelector('[summoner-legend-template]');
const summonerLegendsContainer = document.querySelector('[search-legends-container]');

const searchSummonerInput = document.getElementById('input-search-summoner');
const searchSummonerButton = document.getElementById('button-search-summoner');

region = 'na1';
api_key = 'RGAPI-67bfc2df-e9cb-48dc-ba2a-2cc4959939c1';

async function searchSummoner(summonerName) {
  await getSummonerDTO(summonerName);
  const summonerID = document.querySelector('[summonerDTO-id]').innerHTML;
  await getTFTLegneds(summonerID);
}

async function getSummonerDTO(summonerName) {
  api_url = 'https://' + region + '.api.riotgames.com/tft/summoner/v1/summoners/by-name/' + summonerName + '?api_key=' + api_key;

  let response = await fetch(api_url);
  let summonerDTO = await response.json();

  const summoner = summonerDTOTemplate.content.cloneNode(true).children[0];
  console.log(summoner);
  console.log(summonerDTO);

  const accountId = summoner.querySelector('[summonerDTO-accountId]');
  const profileIconId = summoner.querySelector('[summonerDTO-profileIconId]');
  const revisionDate = summoner.querySelector('[summonerDTO-revisionDate]');
  const name = summoner.querySelector('[summonerDTO-name]');
  const id = summoner.querySelector('[summonerDTO-id]');
  const puuid = summoner.querySelector('[summonerDTO-puuid]');
  const summonerLevel = summoner.querySelector('[summonerDTO-summonerLevel]');

  accountId.textContent = summonerDTO.accountId;
  profileIconId.textContent = summonerDTO.profileIconId;
  revisionDate.textContent =
    new Date(summonerDTO.revisionDate).toLocaleDateString('en-US') + ' ' + new Date(summonerDTO.revisionDate).toLocaleTimeString('en-US');
  name.textContent = summonerDTO.name;
  id.textContent = summonerDTO.id;
  puuid.textContent = summonerDTO.puuid;
  summonerLevel.textContent = summonerDTO.summonerLevel;

  summonerDTOContainer.append(summoner);
}

async function getTFTLegneds(summonerID) {
  api_url = 'https://' + region + '.api.riotgames.com/tft/league/v1/entries/by-summoner/' + summonerID + '?api_key=' + api_key;
  let response = await fetch(api_url);
  let legends = await response.json();

  legends.forEach((legend_data) => {
    const legend = summonerLegendTemplate.content.cloneNode(true).children[0];

    const freshBlood = legend.querySelector('[legend-freshBlood]');
    const hotStreak = legend.querySelector('[legend-hotStreak]');
    const inactive = legend.querySelector('[legend-inactive]');
    const leagueId = legend.querySelector('[legend-leagueId]');
    const leaguePoints = legend.querySelector('[legend-leaguePoints]');
    const losses = legend.querySelector('[legend-losses]');
    const puuid = legend.querySelector('[legend-puuid]');
    const queueType = legend.querySelector('[legend-queueType]');
    const rank = legend.querySelector('[legend-rank]');
    const summonerId = legend.querySelector('[legend-summonerId]');
    const summonerName = legend.querySelector('[legend-summonerName]');
    const tier = legend.querySelector('[legend-tier]');
    const veteran = legend.querySelector('[legend-veteran]');
    const wins = legend.querySelector('[legend-wins]');

    freshBlood.textContent = legend_data.freshBlood;
    hotStreak.textContent = legend_data.hotStreak;
    inactive.textContent = legend_data.inactive;
    leagueId.textContent = legend_data.leagueId;
    leaguePoints.textContent = legend_data.leaguePoints;
    losses.textContent = legend_data.losses;
    puuid.textContent = legend_data.puuid;
    queueType.textContent = legend_data.queueType;
    rank.textContent = legend_data.rank;
    summonerId.textContent = legend_data.summonerId;
    summonerName.textContent = legend_data.summonerName;
    tier.textContent = legend_data.tier;
    veteran.textContent = legend_data.veteran;
    wins.textContent = legend_data.wins;

    summonerLegendsContainer.append(legend);
  });
}

function inputSearchSummoner(e) {
  if (searchSummonerInput.value.length > 0 && e.which === 13) {
    searchSummoner(searchSummonerInput.value);
  }
}

function buttonSearchSummoner(e) {
  if (searchSummonerInput.value.length > 0) {
    searchSummoner(searchSummonerInput.value);
  }
}

searchSummonerInput.addEventListener('keypress', inputSearchSummoner);
searchSummonerInput.addEventListener('click', buttonSearchSummoner);
