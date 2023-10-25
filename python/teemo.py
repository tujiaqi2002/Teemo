import requests
import psycopg2 as pg
import json
import pandas as pd
import pprint 
import mysql.connector
from mysql.connector import errorcode
from datetime import datetime

pp = pprint.PrettyPrinter(indent=4)

region = "na1"
api_key = "RGAPI-ae97994b-3170-4889-bcfa-18e8e84a6b4f"

class summoner:
    def __init__(self,name):
        self.name = name
        
        self.get_SummonerDTO()
        self.get_tft_legend()
        self.get_tft_matches()
        
    def get_SummonerDTO(self):
        '''
        SummonerDTO
            represents a summoner\n
        
        Add
            accountId	string	Encrypted account ID. Max length 56 characters.\n
            profileIconId	int	ID of the summoner icon associated with the summoner.\n
            revisionDate	long	Date summoner was last modified specified as epoch milliseconds. The following events will update this timestamp: summoner name change, summoner level change, or profile icon change.\n
            name	string	Summoner name.\n
            id	string	Encrypted summoner ID. Max length 63 characters.\n
            puuid	string	Encrypted PUUID. Exact length of 78 characters.\n
            summonerLevel	long	Summoner level associated with the summoner.\n
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
        print('SummonerDTO is ---------------')
        pp.pprint(SummonerDTO)
        
        # convert the Unix timestamp into datetime
        SummonerDTO['revisionDate'] = datetime.utcfromtimestamp(SummonerDTO['revisionDate']/1000).strftime('%Y-%m-%d %H:%M:%S')
        self.summonerDTO = SummonerDTO
        
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
         

def DB_init():
    DB_NAME = 'teemo'

    TABLES = {}
    TABLES['SummonerDTO'] = (
        "CREATE TABLE `SummonerDTO` ("
        "  `accountId` varchar(100) NOT NULL ,"
        "  `id` varchar(100) NOT NULL ,"
        "  `name` varchar(100) NOT NULL,"
        "  `profileIconId` int NOT NULL,"
        "  `puuid` varchar(100) NOT NULL,"
        "  `revisionDate` date NOT NULL,"
        "  `summonerLevel` int NOT NULL"
        ") ENGINE=InnoDB")
    
    TABLES['RANKED_TFT'] = (
        "CREATE TABLE `RANKED_TFT` ("
        "  `puuid` varchar(100) NOT NULL,"
        "  `summonerId` varchar(100) NOT NULL,"
        "  `summonerName` varchar(100) NOT NULL,"
        "  `tier` varchar(100) NOT NULL,"
        "  `rank` varchar(100) NOT NULL,"
        "  `leagueId` varchar(100) NOT NULL,"
        "  `freshBlood` boolean NOT NULL ,"
        "  `hotStreak` boolean NOT NULL ,"
        "  `inactive` boolean NOT NULL,"
        "  `leaguePoints` int NOT NULL,"
        "  `losses` int NOT NULL,"
        "  `queueType` varchar(100) NOT NULL,"
        "  `veteran` boolean NOT NULL,"
        "  `wins` int NOT NULL"
        ") ENGINE=InnoDB")
    
    # TABLES['MatchDTO'] = (
    #     "CREATE TABLE `RANKED_TFT` ("
    #     "  `game_datetime` date NOT NULL,"
    #     "  `game_length` varchar(100) NOT NULL,"
    #     "  `game_variation` varchar(100) NOT NULL,"
    #     "  `game_version` varchar(100) NOT NULL,"
    #     "  `participantDTO_id` varchar(100) NOT NULL,"
    #     "  `queue_id` varchar(100) NOT NULL,"
    #     "  `tft_set_number` boolean NOT NULL ,"
    #     ") ENGINE=InnoDB")
    

    
    mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="tujiaqi321756623",
    database="teemo"
    )
    
    cursor = mydb.cursor()
    cursor.execute("DROP TABLE IF EXISTS SummonerDTO")
    cursor.execute("DROP TABLE IF EXISTS RANKED_TFT")
    
    try:
        cursor.execute("USE {}".format(DB_NAME))
    except mysql.connector.Error as err:
        print("Database {} does not exists.".format(DB_NAME))
        if err.errno == errorcode.ER_BAD_DB_ERROR:
            create_database(cursor,DB_NAME)
            print("Database {} created successfully.".format(DB_NAME))
            mydb.database = DB_NAME
        else:
            print(err)
            exit(1)

    for table_name in TABLES:
        table_description = TABLES[table_name]
        try:
            print("Creating table {}: ".format(table_name), end='')
            cursor.execute(table_description)
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
                print("already exists.")
            else:
                print(err.msg)
        else:
            print("OK")

    cursor.close()
    mydb.close()
    
def create_database(cursor,DB_NAME):
    try:
        cursor.execute(
            "CREATE DATABASE {} DEFAULT CHARACTER SET 'utf8'".format(DB_NAME))
    except mysql.connector.Error as err:
        print("Failed creating database: {}".format(err))
        exit(1)

def insert_data(summoner):
    cnx = mysql.connector.connect(
        host="localhost",
        user="root",
        password="tujiaqi321756623",
        database="teemo"
        )
        
    cursor = cnx.cursor()
    
    # --------------------------------------------------------------------- insert data into SummonerDTO -------------------------------------------------------------------------
    add_summoner = ("INSERT INTO SummonerDTO "
                    "(accountId, id, name, profileIconId, puuid, revisionDate, summonerLevel)"
                    "VALUES (%(accountId)s,%(id)s,%(name)s,%(profileIconId)s,%(puuid)s,%(revisionDate)s,%(summonerLevel)s)")
    
    data_summoner = summoner.summonerDTO
    
    
    try:
        cursor.execute(add_summoner, data_summoner)
    except mysql.connector.Error as err:
        print("Insert failed")
        print(err.msg)
    else:
        print("Insert data into SummonerDTO table successfully")
    
    # --------------------------------------------------------------------- insert data into RANKED_TFT -------------------------------------------------------------------------
    add_rank = ("INSERT INTO RANKED_TFT "
                "(`puuid`, `summonerId`, `summonerName`, `tier`, `rank`, `leagueId`, `freshBlood`, `hotStreak`, `inactive`, `leaguePoints`, `losses`, `queueType`, `veteran`, `wins`) "
                "VALUES (%(puuid)s, %(summonerId)s, %(summonerName)s, %(tier)s, %(rank)s, %(leagueId)s, %(freshBlood)s, %(hotStreak)s, %(inactive)s, %(leaguePoints)s, %(losses)s, %(queueType)s, %(veteran)s, %(wins)s)")

    data_rank = summoner.rank_info
    
    try:
        cursor.execute(add_rank, data_rank)
    except mysql.connector.Error as err:
        print("Insert failed")
        print(err.msg)
    else:
        print("Insert data into RANKED_TFT successfully")
    
    
        
        
    cnx.commit()
    cursor.close()
    cnx.close()
    
    
    
if __name__ == "__main__":

    DB_init()
    
    # teemo is the searhced summoner
    teemo = summoner("kissing u")
    
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
    
    insert_data(teemo)
    
    print(teemo.__dir__())
        
    


