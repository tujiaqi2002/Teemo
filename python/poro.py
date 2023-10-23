import requests
import psycopg2 as pg
import json
import pandas as pd
import pprint 
import mysql.connector

pp = pprint.PrettyPrinter(indent=4)

region = 'na1'
api_key = "RGAPI-b4feb658-9065-4c20-b033-6afb6fa0535c"

class summoner:
    def __init__(self,name):
        self.name = name
        
        self.get_SummonerDTO()
        self.get_LeagueEntryDTO()
        
        
    def get_SummonerDTO(self):
        # SummonerDTO - represents a summoner
        
        # NAME	DATA TYPE	DESCRIPTION
        # accountId	string	Encrypted account ID. Max length 56 characters.
        # profileIconId	int	ID of the summoner icon associated with the summoner.
        # revisionDate	long	Date summoner was last modified specified as epoch milliseconds. The following events will update this timestamp: summoner name change, summoner level change, or profile icon change.
        # name	string	Summoner name.
        # id	string	Encrypted summoner ID. Max length 63 characters.
        # puuid	string	Encrypted PUUID. Exact length of 78 characters.
        # summonerLevel	long	Summoner level associated with the summoner.
        
        api_url = (
            "https://" + 
            region +
            ".api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
            self.name +
            "?api_key=" +
            api_key
        )
        resp = requests.get(api_url)
        SummonerDTO = resp.json()
        pp.pprint(SummonerDTO)
        self.accountId = SummonerDTO['accountId']
        self.profileIconId = SummonerDTO['profileIconId']
        self.revisionDate = SummonerDTO['revisionDate']
        self.id = SummonerDTO['id']
        self.puuid = SummonerDTO['puuid']
        self.summonerLevel = SummonerDTO['summonerLevel']
        
    def get_LeagueEntryDTO(self):
        # LeagueEntryDTO
        
        # NAME	DATA TYPE	DESCRIPTION
        # leagueId	string	
        # summonerId	string	Player's encrypted summonerId.
        # summonerName	string	
        # queueType	string	
        # tier	string	
        # rank	string	The player's division within a tier.
        # leaguePoints	int	
        # wins	int	Winning team on Summoners Rift.
        # losses	int	Losing team on Summoners Rift.
        # hotStreak	boolean	
        # veteran	boolean	
        # freshBlood	boolean	
        # inactive	boolean	
        # miniSeries	MiniSeriesDTO
        
        api_url = (
            "https://" +
            region +
            ".api.riotgames.com/lol/league/v4/entries/by-summoner/" +
            self.id +
            "?api_key=" +
            api_key
        )
        resp = requests.get(api_url)
        LeagueEntryDTO = resp.json()
        pp.pprint(LeagueEntryDTO)
    
        for league in LeagueEntryDTO:
            if league['queueType'] == 'RANKED_FLEX_SR':
                self.rank_flex = league
            elif league['queueType'] == 'RANKED_SOLO_5x5':
                self.rank_solo = league
                
        
        

def get_match_ids(puuid, mass_region, api_key):
    api_url = (
        "https://" +
        mass_region +
        ".api.riotgames.com/lol/match/v5/matches/by-puuid/" +
        puuid + 
        "/ids?start=0&count=20" + 
        "&api_key=" + 
        api_key
    )
    
    print(api_url)
    
    resp = requests.get(api_url)
    match_ids = resp.json()
    return match_ids

def get_match_data(match_id, mass_region, api_key):
    api_url = (
        "https://" + 
        mass_region + 
        ".api.riotgames.com/lol/match/v5/matches/" +
        match_id + 
        "?api_key=" + 
        api_key
    )
    
    resp = requests.get(api_url)
    match_data = resp.json()
    return match_data

def get_player_name(puuid,mass_region,api_key):
    api_url = (
        "https://" + 
        mass_region + 
        ".api.riotgames.com/riot/account/v1/accounts/by-puuid/" +
        puuid + 
        "?api_key=" + 
        api_key
    )
    resp = requests.get(api_url)
    player_name = resp.json()
    return player_name['gameName']

def get_match_players(puuid_list,mass_region,api_key):
    player_names = []
    for puuid in puuid_list:
        player_names.append(get_player_name(puuid,mass_region,api_key))
    return player_names

def get_match_players_info(match_players_data):
    pd.set_option('display.max_rows', 200)
    pd.set_option('display.max_columns', 200)
    
    df_list = []  # List to hold each player's DataFrame
    
    for player_data in match_players_data:

        # Clean up not needed data
        _ = player_data.pop('challenges', None)
        _ = player_data.pop('perks', None)

        # Create a DataFrame for this player's data and add it to the list
        df = pd.DataFrame(player_data, index=[0])
        df_list.append(df)


    # Concatenate all of the DataFrames in df_list
    all_data = pd.concat(df_list, ignore_index=True)
    
    # Select the desire cols
    
    # print(all_data)
    # print(all_data.columns.tolist())
    
    desire_cols = ['summonerName','teamId','championName','champLevel','kills','deaths','assists','totalMinionsKilled','totalDamageDealtToChampions','win']
    match_players_info = all_data[desire_cols] 
    print(match_players_info)

    return match_players_info  

def get_player_data(match_data,puuid):
    player_index = match_data['metadata']['participants'].index(puuid)
    player_data = match_data['info']['participants'][player_index]
    champ = player_data['championName']
    k = player_data['kills']
    d = player_data['deaths']
    a = player_data['assists']
    win = player_data['win']
    return champ,k,d,a,win
    
def get_matches_info(puuid, match_ids, mass_region, api_key):
    # We initialise an empty dictionary to store data for each game
    data = {
        'champion': [],
        'kills': [],
        'deaths': [],
        'assists': [],
        'win': []
    }
    
    for match_id in match_ids:
        print(match_id)
        # run the two functions to get the player data from the   match ID
        match_data = get_match_data(match_id, mass_region, api_key)
        match_players_data = match_data['info']['participants']
        print(match_data.keys())
        
        
        
        
        
        # pp.pprint(match_players_data)
        match_players_info = get_match_players_info(match_players_data)
        
        # get the player champion,KDA, win/lose
        champ,k,d,a,win = get_player_data(match_data,puuid)
        
        print(champ,k,d,a,win)
        
        
        
        break
        # # assign the variables we're interested in
        # champion = player_data['championName']
        # k = player_data['kills']
        # d = player_data['deaths']
        # a = player_data['assists']
        # win = player_data['win']
        # # add them to our dataset
        # data['champion'].append(champion)
        # data['kills'].append(k)
        # data['deaths'].append(d)
        # data['assists'].append(a)
        # data['win'].append(win)    
    
    df = pd.DataFrame(data)
    df['win'] = df['win'].astype(int) # change this column from boolean      (True/False) to be integers (1/0)
 
    return df

API_KEY = "RGAPI-cc97b8b5-e470-4b72-92bc-99d5ca8e6b7a"
match_url = "https://americas.api.riotgames.com/lol/match/v5/matches/"



mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="tujiaqi321756623",
  database="poro"
)

mycursor = mydb.cursor()
mycursor.execute("SHOW TABLES")




if __name__ == "__main__":


    search_summoner = summoner('a cute poro snax')
    pp.pprint(dir(search_summoner))
    if (search_summoner.hasattr(rank_solo)):
        print(search_summoner.rank_solo['tier'] + ' ' + search_summoner.rank_solo['rank'])
        print(str(search_summoner.rank_solo['wins']) + 'W ' + str(search_summoner.rank_solo['losses']) + 'L')
        print('Winrate: ' + str(round(search_summoner.rank_solo['wins']/(search_summoner.rank_solo['wins']+search_summoner.rank_solo['losses']),2)))
    
    search_matches = get_match_ids(search_summoner.puuid,"americas",API_KEY)
    print('Matches | ',search_matches)
    search_matches_info = get_matches_info(search_summoner.puuid,search_matches,'americas',API_KEY)
    


