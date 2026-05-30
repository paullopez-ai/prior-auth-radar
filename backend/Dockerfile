FROM python:3.12-slim

WORKDIR /app

# System deps for psycopg2 and building wheels.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

# Single worker keeps the compiled LangGraph + Bedrock clients warm per instance.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
