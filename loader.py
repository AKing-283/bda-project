import pandas as pd
from pymongo import MongoClient

# 1. Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")  # Replace with your URI if needed
db = client["weather_db"]
collection = db["weather_data_1"]

# 2. Read CSV
df = pd.read_csv("india_2000_2024_daily_weather.csv")  # or read_json("weather.json")

# 3. Convert DataFrame to dictionary
data = df.to_dict(orient="records")

# 4. Insert into MongoDB (bulk insert)
if data:
    collection.insert_many(data)
    print(f"Inserted {len(data)} rows into MongoDB")
else:
    print("No data found in CSV")
