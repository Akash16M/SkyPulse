from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
TIMEOUT = 15

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/api/search")
def search_city():
    query = request.args.get("q", "").strip()
    if len(query) < 2:
        return jsonify({"error": "Enter at least two characters."}), 400
    try:
        response = requests.get(
            GEOCODING_URL,
            params={"name": query, "count": 8, "language": "en", "format": "json"},
            timeout=TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
        places = []
        for item in data.get("results", []):
            places.append({
                "name": item.get("name"),
                "admin1": item.get("admin1", ""),
                "country": item.get("country", ""),
                "latitude": item.get("latitude"),
                "longitude": item.get("longitude"),
                "timezone": item.get("timezone", "auto"),
            })
        return jsonify({"results": places})
    except requests.RequestException:
        return jsonify({"error": "Could not reach the location service. Please try again."}), 502

@app.get("/api/weather")
def weather():
    try:
        lat = float(request.args["lat"])
        lon = float(request.args["lon"])
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "A valid location is required."}), 400

    try:
        forecast_response = requests.get(
            FORECAST_URL,
            params={
                "latitude": lat,
                "longitude": lon,
                "timezone": "auto",
                "forecast_days": 7,
                "current": (
                    "temperature_2m,relative_humidity_2m,apparent_temperature,"
                    "is_day,precipitation,weather_code,cloud_cover,pressure_msl,"
                    "wind_speed_10m,wind_direction_10m,wind_gusts_10m"
                ),
                "hourly": (
                    "temperature_2m,relative_humidity_2m,precipitation_probability,"
                    "precipitation,weather_code,wind_speed_10m,uv_index"
                ),
                "daily": (
                    "weather_code,temperature_2m_max,temperature_2m_min,"
                    "sunrise,sunset,uv_index_max,precipitation_sum,"
                    "precipitation_probability_max,wind_speed_10m_max"
                ),
            },
            timeout=TIMEOUT,
        )
        forecast_response.raise_for_status()
        forecast = forecast_response.json()

        air = {}
        try:
            air_response = requests.get(
                AIR_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "timezone": "auto",
                    "current": "us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone",
                },
                timeout=TIMEOUT,
            )
            air_response.raise_for_status()
            air = air_response.json().get("current", {})
        except (requests.RequestException, ValueError):
            air = {}

        return jsonify({"weather": forecast, "air": air})
    except requests.RequestException:
        return jsonify({"error": "Weather data is temporarily unavailable. Please try again."}), 502
    except ValueError:
        return jsonify({"error": "The weather service returned an invalid response."}), 502

@app.get("/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True)
