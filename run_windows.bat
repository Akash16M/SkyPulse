@echo off
title WeatherWise - Advanced Weather Forecast
cd /d "%~dp0"
if not exist .venv (
    echo Creating virtual environment...
    py -m venv .venv
    if errorlevel 1 python -m venv .venv
)
call .venv\Scripts\activate
echo Installing required packages...
python -m pip install --upgrade pip
pip install -r requirements.txt
echo.
echo Starting WeatherWise...
echo Open http://127.0.0.1:5000 in your browser.
python app.py
pause
