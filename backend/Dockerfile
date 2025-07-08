# Use official Python base image
FROM python:3.11

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=1.8.2

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /app

# Copy project files
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

RUN chmod +x /usr/local/bin/uvicorn

# Copy the rest of your code
COPY . .

# Expose port (FastAPI default via Uvicorn)
EXPOSE 8000

RUN chmod +x /app/start.sh

# Start the FastAPI app with Uvicorn
CMD ["/app/start.sh"]
