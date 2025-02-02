# Auth Service Stress Tests

This directory contains stress tests for the Auth Service using Locust.

## Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Tests

1. Start Locust:
```bash
locust -f locustfile.py
```

2. Open your browser and go to http://localhost:8089

3. Configure your test:
   - Number of users (peak concurrency)
   - Spawn rate (users started/second)
   - Host (your auth service URL, e.g., http://localhost:3000)

## Metrics in Grafana

The stress tests will generate metrics that can be visualized in Grafana:

- Request Response Times
- Number of Users
- Requests per Second
- Failure Rates
- Error Rates

To view these metrics in Grafana:

1. Ensure Prometheus is scraping your Auth Service metrics
2. Import the Locust dashboard in Grafana
3. Configure the dashboard to use your Prometheus data source

## Test Scenarios

The stress test includes two main scenarios:

1. User Registration (`/users` endpoint)
   - Creates random user data
   - Tests the registration process
   - Weight: 1 (33% of requests)

2. User Login (`/auth/login` endpoint)
   - Uses created test users to attempt login
   - Tests the authentication process
   - Weight: 2 (66% of requests)

## Notes

- The test automatically generates random user data
- Failed requests are logged and tracked
- Test users are stored in memory during the test session
- The ratio of login:register requests is 2:1 