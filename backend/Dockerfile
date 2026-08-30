FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose default port
EXPOSE 8000

# Run server on 0.0.0.0 using PORT env var or 8000 default
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
