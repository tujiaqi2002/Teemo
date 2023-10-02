import requests
import psycopg2 as pg
import json
import pandas as pd
import pprint 
import mysql.connector

pp = pprint.PrettyPrinter(indent=4)

region = 'na1'
api_key = "RGAPI-431127f0-c159-4c5d-865a-9cb61e9bb07e"

class summoner:
    def __init__(self,name):
        self.name = name
        
        self.get_SummonerDTO()
        self.get_tft_legend()
        self.get_tft_matches()
        
    def get_SummonerDTO(self):
        '''
        SummonerDTO - represents a summoner
        Add
            accountId	string	Encrypted account ID. Max length 56 characters.
            
            profileIconId	int	ID of the summoner icon associated with the summoner.
            
            revisionDate	long	Date summoner was last modified specified as epoch milliseconds. The following events will update this timestamp: summoner name change, summoner level change, or profile icon change.
            
            name	string	Summoner name.
            
            id	string	Encrypted summoner ID. Max length 63 characters.
            
            puuid	string	Encrypted PUUID. Exact length of 78 characters.
            
            summonerLevel	long	Summoner level associated with the summoner.
        '''
        
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
        
    
    def get_tft_legend(self):
        '''
        Add
            rank: summoner rank
            rank_info: dictionary to extract data
        '''
        
        api_url = (
            "https://" + 
            region +
            ".api.riotgames.com/tft/league/v1/entries/by-summoner/" +
            self.id +
            "?api_key=" +
            api_key
        )
        resp = requests.get(api_url)
        tft_legends = resp.json()
        
        pp.pprint(tft_legends)
        
        # the legend_dict store all the queue type rank
        legend_dict = {}
        for legend in tft_legends:
            key = legend['queueType']
            legend_dict[key] = legend
            
            if key == 'RANKED_TFT':
                self.rank = legend['tier'] + ' ' + legend['rank'] + ' ' + str(legend['leaguePoints'])
        
        print(self.rank)
        self.rank_info = legend_dict['RANKED_TFT']
        print(self.rank_info)
    
    def get_tft_matches(self):
        '''
        Add
            match_ids | list | a list contain the last 20 match ids
        '''
        api_url = (
            "https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/" +
            self.puuid +
            "/ids?start=0&count=20" +
            "&api_key=" +
            api_key
        )
        resp = requests.get(api_url)
        tft_match_ids = resp.json()
        pp.pprint(tft_match_ids)
        self.match_ids = tft_match_ids
        
        
def get_match_info(match_id):
    api_url = (
                "https://americas.api.riotgames.com/tft/match/v1/matches/" +
                match_id +
                "?api_key=" +
                api_key
            )
    resp = requests.get(api_url)
    MatchDto = resp.json()
    pp.pprint(MatchDto)
    
    return MatchDto
         


if __name__ == "__main__":
    # teemo is the searhced summoner
    teemo = summoner('a cute poro snax')
    
    matche_ids = teemo.match_ids
    
    teemo_match_history = []
    for match_id in matche_ids:
        match_participants = get_match_info(match_id)['info']['participants']
        
        for match_participant in match_participants:
            # get puuid to pull the data later
            player_puuid = match_participant['puuid']
            if player_puuid == teemo.puuid:
                pp.pprint(match_participant)
                break
        
        break
        
    


