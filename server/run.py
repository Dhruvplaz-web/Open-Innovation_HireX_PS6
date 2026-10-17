import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting HireX Backend on {host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port)
