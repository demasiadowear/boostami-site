@echo off
echo ================================================
echo  Brand Automation - Setup
echo ================================================
echo.

cd /d "%~dp0brand-scraper"

echo [1/3] Creazione virtual environment Python...
python -m venv venv
if errorlevel 1 (echo ERRORE: Python non trovato. Installa Python 3.11+ & exit /b 1)

echo [2/3] Installazione dipendenze...
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet

echo [3/3] Avvio Brand Scraper su porta 8000...
echo.
echo  Brand Scraper: http://localhost:8000
echo  Docs API:      http://localhost:8000/docs
echo.
echo  Premi CTRL+C per fermare.
echo.
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
