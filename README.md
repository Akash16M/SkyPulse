# 🌤️ SkyPulse – Advanced Weather Forecast Website

**SkyPulse** is a modern and responsive weather forecast web application that provides real-time weather information, hourly forecasts, 7-day weather predictions, and air quality details for cities around the world.

Built using **Python, Flask, HTML, CSS, and JavaScript**, SkyPulse offers a clean interface with useful weather insights — without requiring user registration or a database.

## ✨ Features

- 🌍 **City Search:** Search for weather information in cities worldwide.
- 📍 **Current Location:** Get weather updates using your browser's location.
- 🌡️ **Current Weather:** View temperature, feels-like temperature, humidity, wind speed, pressure, and more.
- 🕒 **Hourly Forecast:** Check upcoming hourly weather conditions with interactive charts.
- 📅 **7-Day Forecast:** View weather predictions for the next seven days.
- 🌅 **Sunrise & Sunset:** Get daily sunrise and sunset timings.
- 🌫️ **Air Quality:** Check AQI and available air pollution details such as PM2.5, PM10, and O₃.
- 🌡️ **Temperature Conversion:** Switch between Celsius and Fahrenheit.
- ⭐ **Favourite Cities:** Save favourite cities for quick access.
- 🕘 **Recent Searches:** Quickly revisit previously searched cities.
- 🌙 **Dark & Light Mode:** Switch between themes.
- 📱 **Responsive Design:** Works across desktop, tablet, and mobile devices.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| Flask | Web application framework |
| HTML5 | Website structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| Chart.js | Weather forecast charts |
| Open-Meteo API | Weather and air quality data |

## 📂 Project Structure

```text
SkyPulse/
│
├── app.py
├── requirements.txt
├── run_windows.bat
├── README.md
├── .gitignore
│
├── templates/
│   └── index.html
│
└── static/
    ├── css/
    │   └── style.css
    │
    └── js/
        └── app.js
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project Folder

```bash
cd SkyPulse
```

### 3. Create a Virtual Environment

```bash
python -m venv .venv
```

### 4. Activate the Virtual Environment

**Windows:**

```bash
.venv\Scripts\activate
```

### 5. Install Required Packages

```bash
pip install -r requirements.txt
```

### 6. Run the Application

```bash
python app.py
```

### 7. Open in Browser

```text
http://127.0.0.1:5000
```

**Note:** An active internet connection is required to retrieve weather information from the Open-Meteo APIs.

## 🌐 API Used

SkyPulse uses free Open-Meteo services:

- [Open-Meteo Weather API](https://open-meteo.com/)
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)

No API key or database is required.

## 🎯 Project Objectives

- Build a practical real-world web application using Python and Flask.
- Understand frontend and backend integration.
- Work with external REST APIs.
- Display dynamic weather information using JavaScript.
- Develop a responsive and user-friendly interface.

## 🚀 Future Improvements

- Weather alerts and notifications.
- Interactive weather maps.
- Weather comparison between multiple cities.
- Progressive Web App (PWA) support.

## 👨‍💻 Developer

**Akash**

GitHub: [Akash16M](https://github.com/Akash16M)

---

⭐ If you find this project useful, consider giving it a star!

**SkyPulse – Your Weather, Your World.**