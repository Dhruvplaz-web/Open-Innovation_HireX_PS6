import uvicorn
import os
import sys

# Ensure current directory is on PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    is_dev = os.getenv("ENVIRONMENT", "production").lower() == "development"
    print(f"[STARTING] HireX AI-ML Backend Engine on http://{host}:{port} ...")
    uvicorn.run("app.main:app", host=host, port=port, reload=is_dev)
