const summonerDTOTemplate = document.querySelector('[summoner-summonerDTO-template]');
const summonerDTOContainer = document.querySelector('[search-summonerDTO-container]');

const summonerLegendTemplate = document.querySelector('[summoner-legend-template]');
const summonerLegendsContainer = document.querySelector('[search-legends-container]');

const summonerMatchupTemplate = document.querySelector('[summoner-matchup-template]');
const summonerMatchupsContainer = document.querySelector('[search-matches-container]');

const searchSummonerInput = document.getElementById('input-search-summoner');
const searchSummonerButton = document.getElementById('button-search-summoner');

let region = 'na1';
let api_key = 'RGAPI-0a5d16cb-eb15-4831-ac0e-d1b96d15590f';

async function searchSummoner(summonerName) {
  await getSummonerDTO(summonerName);
  const summonerID = document.querySelector('[summonerDTO-id]').innerHTML;
  const puuid = document.querySelector('[summonerDTO-puuid]').innerHTML;
  await getTFTLegneds(summonerID);
  await getMatchIds(puuid);
}

async function getDataSet(name) {
  return fetch('./public/tft_data_set/' + name + '.json').then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  });
}

async function getSummonerDTO(summonerName) {
  const api_url = 'https://' + region + '.api.riotgames.com/tft/summoner/v1/summoners/by-name/' + summonerName + '?api_key=' + api_key;

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

  let profileIconImg = new Image();
  profileIconImg.src = './public/dragontail-13.20.1/13.20.1/img/profileicon/' + summonerDTO.profileIconId + '.png';
  profileIconId.appendChild(profileIconImg);
}

async function getTFTLegneds(summonerID) {
  const api_url = 'https://' + region + '.api.riotgames.com/tft/league/v1/entries/by-summoner/' + summonerID + '?api_key=' + api_key;
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

    let tierImg = new Image();
    tierImg.src = './public/dragontail-13.20.1/13.20.1/img/tft-regalia/TFT_Regalia_' + legend_data.tier + '.png';
    tier.appendChild(tierImg);
  });
}

async function getMatchIds(puuid) {
  const api_url = 'https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/' + puuid + '/ids?start=0&count=20' + '&api_key=' + api_key;
  let response = await fetch(api_url);
  let matchIds = await response.json();

  for (let i = 0; i < 10; i++) {
    await getMatchInfo(matchIds[i], puuid);
  }
}

async function fetchData(promise) {
  let fetchedData = await promise;
  return fetchedData;
}

async function getMatchInfo(matchId, puuid) {
  const api_url = 'https://americas.api.riotgames.com/tft/match/v1/matches/' + matchId + '?api_key=' + api_key;
  let response = await fetch(api_url);
  let matchInfo = await response.json();

  let game_datetime = matchInfo['info']['game_datetime'];
  let game_length = matchInfo['info']['game_length'];

  const matchup = summonerMatchupTemplate.content.cloneNode(true).children[0];

  const iconSectionDiv = matchup.querySelector('.icon-section');
  const iconDiv = matchup.querySelector('.icon');
  const levelDiv = matchup.querySelector('.level');
  const gameInfoSectionDiv = matchup.querySelector('.game-info-section');
  const queueTypeDiv = matchup.querySelector('.queue-type');
  const gameLengthDiv = matchup.querySelector('.game-length');
  const gameDateDiv = matchup.querySelector('.game-date');
  const ingameInfoSectionDiv = matchup.querySelector('.ingame-info-section');
  const augmentSectionDiv = matchup.querySelector('.augment-section');
  const unitsTraitsSectionDiv = matchup.querySelector('.units-traits-section');
  const unitsDiv = matchup.querySelector('.units');
  const traitsDiv = matchup.querySelector('.traits');

  // queue-type
  const queuesMap = await fetchData(getDataSet('Queues'));
  console.log(queuesMap);
  gameType = queuesMap['data'][matchInfo['info']['queue_id']]['name'];

  queueTypeDiv.textContent = gameType == 'DOUBLE UP (WORKSHOP)' ? 'Double Up' : gameType;
  //game-length
  gameLengthDiv.textContent =
    String(Math.floor(matchInfo['info']['game_length'] / 60)) + ':' + String(Math.floor(matchInfo['info']['game_length'] % 60));

  // game-date
  gameDateDiv.textContent = new Date(matchInfo['info']['game_datetime']).toLocaleDateString('en-US');

  matchInfo['info']['participants'].forEach(async (participant) => {
    if (participant['puuid'] != puuid) {
      return;
    }

    console.log(participant);

    // tactician icon
    const tacticiansMap = await fetchData(getDataSet('Tacticians'));
    let tacticianImg = new Image();
    tacticianImg.src =
      './public/dragontail-13.20.1/13.20.1/img/tft-tactician/' + tacticiansMap['data'][participant['companion']['item_ID']]['image']['full'];

    iconDiv.append(tacticianImg);

    // level info
    levelDiv.textContent = participant['level'];

    // augments
    const augmentsMap = await fetchData(getDataSet('Augments'));
    augments = participant['augments'];
    console.log(augments);
    augments.forEach((augment) => {
      let augmentImg = new Image();
      console.log(augmentsMap['data'][augment]);
      augmentImg.src = './public/dragontail-13.20.1/13.20.1/img/tft-augment/' + augmentsMap['data'][augment]['image']['full'];
      augmentSectionDiv.append(augmentImg);
    });

    // units
    const championsMap = await fetchData(getDataSet('Champions'));
    units = participant['units'];
    console.log(units);
    units.forEach((unit) => {
      let unitImg = new Image();
      console.log(championsMap['data'][unit['character_id']]['image']['full']);
      console.log(championsMap['data'][unit['character_id']]['name'])
      // unitImg.src = './public/dragontail-13.20.1/13.20.1/img/tft-champion/' + championsMap['data'][unit['character_id']]['image']['full'];
      unitImg.src = './public/dragontail-13.20.1/13.20.1/img/champion/' + championsMap['data'][unit['character_id']]['name'].replace(/['\s]/g, '') + ".png";
                    // public/dragontail-13.20.1/13.20.1/img/champion/Mordekaiser.png
      unitsDiv.append(unitImg);
    });

    // traits
    const traitsMap = await fetchData(getDataSet('Traits'));
    traits = participant['traits'];
    console.log(traits);

    traits.sort(function (a, b) {
      if (a.style === b.style) {
        // If 'style' is the same, sort by 'tier_current' in ascending order
        return a.tier_current - b.tier_current;
      } else {
        // Sort by 'style' in descending order
        return b.style - a.style;
      }
    });

    traits.forEach((trait) => {
      let traitImg = new Image();
      console.log(traitsMap['data'][trait['name']]['image']['full']);
      traitImg.src = './public/dragontail-13.20.1/13.20.1/img/tft-trait/' + traitsMap['data'][trait['name']]['image']['full'];
      // public/dragontail-13.20.1/13.20.1/img/tft-trait/Trait_Icon_9_Darkin.TFT_Set9.png

      switch (trait['style']) {
        case 0:
          return;
        case 1:
          traitImg.style.backgroundColor = 'brown';
          break;
        case 2:
          traitImg.style.backgroundColor = 'gray';
          break;
        case 3:
          traitImg.style.backgroundColor = 'gold';
          break;
        case 4:
          traitImg.style.backgroundColor = 'gray';
          break;
      }
      traitsDiv.append(traitImg);
    });
  });

  summonerMatchupsContainer.append(matchup);
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
