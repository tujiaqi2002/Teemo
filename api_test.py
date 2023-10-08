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
api_key = "RGAPI-97577450-d364-4e9c-9e5c-b47c1686fbe5"
puuid = "ZGGNdHjMLUvfChSu8ukY-PfBa_NdFVWaojM3zVBIA39iC8cYzJn416u7X_1buCa69NvHH-wEyvMaUA"

api_url = (
            "https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/"+
            puuid +
            "/ids?endTime=1696346373&startTime=1686628800&count=100" +
            "&api_key=" +
            api_key
            
        )

resp = requests.get(api_url)
SummonerDTO = resp.json()
print('SummonerDTO is ---------------')
pp.pprint(SummonerDTO)