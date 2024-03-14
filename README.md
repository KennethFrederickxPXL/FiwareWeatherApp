# FiwareWeatherApp
Weather App: Node.js, Express, Leaflet.js fetches real-time weather from OpenWeatherMap API. Integrates with Fiware Orion Context Broker to manage weather as NGSI-LD entities, empowering developers to create dynamic, weather-aware applications.

# Weather App Installation Guide

## Prerequisites
- Node.js installed on your machine
- Docker and Docker Compose (optional, for running Orion Context Broker and MongoDB)

## Steps to Install:
1. Clone this repository to your local machine:
    ```bash
    git clone https://github.com/KennethFrederickxPXL/FiwareWeatherApp.git
    ```

2. Navigate to the project directory:
    ```bash
    cd node-project
    ```

3. Install dependencies using npm:
    ```bash
    npm install
    ```

4. If you choose to use Docker Compose, run the following command to start Orion Context Broker and MongoDB:
    ```bash
    docker-compose up -d
    ```

5. Start the Weather App server:
    ```bash
    npm start
    ```

6. Access the Weather App in your web browser at [http://localhost:3000](http://localhost:3000)

## Usage:
- Enter a city and select a country from the dropdown menu or enter a custom country code.
- Click the "Search" button to fetch weather data for the specified location.
- Weather information will be displayed along with a map showing the location.

## Note:
- If you choose to run the Orion Context Broker and MongoDB with Docker Compose, ensure that no other services are occupying the same ports (1026 and 27017) to avoid conflicts.
- Make sure to replace `your_username/your_repository` with the actual GitHub repository URL.
- For production deployment, consider securing API keys and sensitive information.
