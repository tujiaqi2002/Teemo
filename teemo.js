const summonerDTOTemplate = document.querySelector('[summoner-summonerDTO-template]');
const summonerDTOContainer = document.querySelector('[search-summonerDTO-container]');

const summonerLegendTemplate = document.querySelector('[summoner-legend-template]');
const summonerLegendsContainer = document.querySelector('[search-legends-container]');

const summonerMatchupTemplate = document.querySelector('[summoner-matchup-template]');
const summonerMatchupsContainer = document.querySelector('[search-matches-container]');

const searchSummonerInput = document.getElementById('input-search-summoner');
const searchSummonerButton = document.getElementById('button-search-summoner');

let region = 'na1';
let api_key = 'RGAPI-120b384e-c492-4641-acc3-2a42e561cfb6';

let searched_puuid;
let searched_summonerID;

function delayedFunction(i) {
  setTimeout(function () {
    // Your code to be executed after waiting for 1 second
    console.log('Code executed after waiting for ${i} second ');
  }, 1000 * i);
}

function resetSearchStats() {
  // Remove all child elements within the containers
  summonerDTOContainer.innerHTML = '';
  summonerMatchupsContainer.innerHTML = '';
  summonerLegendsContainer.innerHTML = '';
}
async function searchSummoner(summonerName) {
  resetSearchStats();
  await getSummonerDTO(summonerName);
  await getTFTLegneds(searched_summonerID);
  await getMatchIds(searched_puuid);
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

  const profileIconId = summoner.querySelector('[summonerDTO-profileIconId]');
  const name = summoner.querySelector('[summonerDTO-name]');

  name.textContent = summonerDTO.name;

  searched_puuid = summonerDTO.puuid;
  searched_summonerID = summonerDTO.id;

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

    if (legend_data.queueType != 'RANKED_TFT') {
      return;
    }
    const leaguePoints = legend.querySelector('[legend-leaguePoints]');
    const queueType = legend.querySelector('[legend-queueType]');
    const tier = legend.querySelector('[legend-tier]');
    const stats = legend.querySelector('[legend-stats]');
    const winrate = legend.querySelector('[legend-winrate]');

    leaguePoints.textContent = legend_data.leaguePoints + ' LP';

    // RANKED_TFT_DOUBLE_UP
    // RANKED_TFT

    queueType.textContent = 'TFT Rank';
    // rank.textContent = legend_data.rank;
    tier.textContent = legend_data.tier + ' ' + legend_data.rank;
    winrate.textContent = 'Win Rate ' + Math.round((legend_data.wins / (legend_data.wins + legend_data.losses)) * 100) + '%';
    stats.textContent = legend_data.wins + 'W  ' + legend_data.losses + 'L';

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

  for (let i = 0; i < 20; i++) {
    if (i == 10) {
      delayedFunction(1);
      console.log('wait for one 1 sec');
    }
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
  const placement = matchup.querySelector('.placement');
  const queueTypeGameLengthDiv = matchup.querySelector('.queue-type-game-length');
  const gameDateDiv = matchup.querySelector('.game-date');
  const ingameInfoSectionDiv = matchup.querySelector('.ingame-info-section');
  const augmentSectionDiv = matchup.querySelector('.augment-section');
  const unitsTraitsSectionDiv = matchup.querySelector('.units-traits-section');
  const unitDiv = matchup.querySelector('.unit');
  const traitsDiv = matchup.querySelector('.traits');

  // queue-type and game length
  const queuesMap = await fetchData(getDataSet('Queues'));
  console.log(queuesMap);
  gameType = queuesMap['data'][matchInfo['info']['queue_id']]['name'];

  // Convert seconds to minutes and seconds
  const minutes = Math.floor(matchInfo['info']['game_length'] / 60);
  const seconds = Math.round(matchInfo['info']['game_length'] % 60);

  queueTypeGameLengthDiv.textContent =
    (gameType == 'DOUBLE UP (WORKSHOP)' ? 'Double Up' : gameType) + ' • ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

  // Create the "minutes:seconds" formatted string
  var formattedGameLength =
    // game-date
    (gameDateDiv.textContent = new Date(matchInfo['info']['game_datetime']).toLocaleDateString('en-US'));

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

    //placement

    let placementTxt;
    switch (participant['placement']) {
      case 1:
        placementTxt = '1ST PLACE';
        break;
      case 2:
        placementTxt = '2ND PLACE';
        break;
      case 3:
        placementTxt = '3RD PLACE';
        break;
      default:
        placementTxt = participant['placement'] + 'TH PLACE';
    }
    placement.textContent = placementTxt;

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

    units = units.sort((a, b) => {
      // First, sort by rarity in descending order (higher rarity comes first)
      if (a.rarity < b.rarity) return 1;
      if (a.rarity > b.rarity) return -1;

      // If rarity is the same, sort by tier in ascending order
      if (a.tier < b.tier) return -1;
      if (a.tier > b.tier) return 1;

      // If both rarity and tier are the same, leave the order as it is
      return 0;
    });

    units.forEach((unit) => {
      if (unit['character_id'] == 'TFT9_THex') {
        return;
      }
      let unitImg = new Image();
      console.log(unit['character_id']);
      console.log(championsMap['data'][unit['character_id']]['image']['full']);
      console.log(championsMap['data'][unit['character_id']]['name']);
      // unitImg.src = './public/dragontail-13.20.1/13.20.1/img/tft-champion/' + championsMap['data'][unit['character_id']]['image']['full'];
      unitImg.src =
        './public/dragontail-13.20.1/13.20.1/img/champion/' + championsMap['data'][unit['character_id']]['name'].replace(/['\s]/g, '') + '.png';
      // public/dragontail-13.20.1/13.20.1/img/champion/Mordekaiser.png
      unitDiv.append(unitImg);

      //level
      let unitLevelImg = new Image()

      //items
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
searchSummonerButton.addEventListener('click', buttonSearchSummoner);
