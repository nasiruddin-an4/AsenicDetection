@echo off
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Starting FastAPI Backend...
python app.py

pause
