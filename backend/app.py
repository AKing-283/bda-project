from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from collections import defaultdict

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db = client.weather_db
collection = db.weather_data_1


def parse_date(date_str):
    for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


@app.route("/api/analytics")
def analytics():
    city = request.args.get("city", "").strip()
    start = request.args.get("start", "").strip()
    end = request.args.get("end", "").strip()

    query = {}
    if city:
        query["city"] = {"$regex": f"^{city}$", "$options": "i"}
    if start and end:
        start_str = parse_date(start)
        end_str = parse_date(end)
        if not start_str or not end_str:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY"}), 400
        query["date"] = {"$gte": start_str, "$lte": end_str}

    docs = list(collection.find(query))
    if not docs:
        return jsonify({"error": "No data found"}), 404

    # Lists to store metrics
    temps = []
    wind_speeds = []
    wind_gusts = []
    wind_directions = []

    # Monthly groupings
    monthly_temp = defaultdict(list)
    monthly_wind_speed = defaultdict(list)
    monthly_wind_gust = defaultdict(list)
    monthly_wind_direction = defaultdict(list)

    for doc in docs:
        # --- Temperature ---
        temp_max = doc.get("temperature_2m_max")
        temp_min = doc.get("temperature_2m_min")
        if temp_max is not None and temp_min is not None:
            avg_temp = (temp_max + temp_min) / 2
            temps.append(avg_temp)

        # --- Wind metrics ---
        ws = doc.get("wind_speed_10m_max")
        wg = doc.get("wind_gusts_10m_max")
        wd = doc.get("wind_direction_10m_dominant")

        if ws is not None:
            wind_speeds.append(ws)
        if wg is not None:
            wind_gusts.append(wg)
        if wd is not None:
            wind_directions.append(wd)

        # --- Monthly aggregation ---
        try:
            month = int(doc["date"].split("-")[1])
            if temp_max is not None and temp_min is not None:
                monthly_temp[month].append(avg_temp)
            if ws is not None:
                monthly_wind_speed[month].append(ws)
            if wg is not None:
                monthly_wind_gust[month].append(wg)
            if wd is not None:
                monthly_wind_direction[month].append(wd)
        except Exception:
            continue

    # Helper functions
    def avg(lst): return round(sum(lst) / len(lst), 2) if lst else None
    def max_val(lst): return round(max(lst), 2) if lst else None
    def min_val(lst): return round(min(lst), 2) if lst else None
    def monthly_avg(d): return {k: round(sum(v) / len(v), 2) for k, v in d.items()}

    # Compute final stats
    result = {
        "average_temperature": avg(temps),
        "max_temperature": max_val(temps),
        "min_temperature": min_val(temps),
        "monthly_temperature_trend": monthly_avg(monthly_temp),

        # Wind analytics
        "average_wind_speed": avg(wind_speeds),
        "max_wind_speed": max_val(wind_speeds),
        "average_wind_gust": avg(wind_gusts),
        "max_wind_gust": max_val(wind_gusts),
        "average_wind_direction": avg(wind_directions),

        # Monthly trends
        "monthly_wind_speed_trend": monthly_avg(monthly_wind_speed),
        "monthly_wind_gust_trend": monthly_avg(monthly_wind_gust),
        "monthly_wind_direction_trend": monthly_avg(monthly_wind_direction)
    }

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
