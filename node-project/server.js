// server.js
const express = require('express');
const cors = require('cors');
const e = require('express');

const app = express();
const PORT = 3000;

const apiKey = 'YOUR_API_KEY';
const link = 'https://api.openweathermap.org/data/2.5/weather?q=';
const ORION_URL = "http://localhost:1026/ngsi-ld/v1/entities";
const NGSI_LD_CONTEXT = "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"

app.use(express.static('public'));
app.use(cors());

// get weather data and transform it to ngsi, then create or update the entity in orion
app.get('/weather', async (req, res) => {
    const { city, countryShort } = req.query;
    const apiUrl = `${link}${city},${countryShort}&APPID=${apiKey}`;

    // Format the city name so that there are no spaces, orion does not accept spaces in the id
    cityNameFormatted = city.replace(/\s/g, '');

    let entityId = "urn:ngsi-ld:WeatherObserved:" + cityNameFormatted + "-" + countryShort;
    const headers = { "Content-Type": "application/ld+json", "Accept": "application/ld+json" };
    const get_response = await fetch(ORION_URL + "/" + entityId, { headers });

    //if it doesnt exist, create or update it
    if (get_response.status != 200) {
        try {
            console.log("Entity does not exist, creating it")
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            const ngsi_entity = await createNgsiEntity(data, entityId);

            console.log("entity created")
            console.log(ngsi_entity)

            await createEntity(ngsi_entity);
        } catch (error) {
            console.error('Error fetching weather data:', error, "Make sure the city and country are correct");
            res.status(500).json({ error: 'Error fetching weather data, Make sure the city and country are correct' });
        }
    } else {
        // if entity exists, and is older than 60 minutes, update it
        const data = await get_response.json();
        const date = new Date();
        const now = date.getTime() / 1000;
        const lastUpdate = data.dateTimeObserved.value;
        const difference = now - lastUpdate;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const newWeatherData = await response.json();

        const updatedEntity = await createNgsiEntity(newWeatherData, entityId);

        if (difference > 3600) {
            let hours = Math.floor(difference / 3600);
            console.log(`Entity exists, but is older than 1 hour, ${hours} hours ago since last update`)
            await updateEntity(updatedEntity)
        }
    }
    //fetch the entity from orion and send it to the client after creation or update
    const response = await fetch(ORION_URL + "/" + entityId, { headers });

    if (!response.ok) {
        console.error('failted to fecth from Orion, Network response was not ok');
        return;
    }

    const data = await response.json();
    console.log("Successfull fetched data from Orion");
    res.json(data);
});

async function createEntity(entity) {
    const response = await fetch(ORION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
    });


    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    console.log("Entity created successfully");
}

async function updateEntity(entity) {
    console.log("Updating:", entity.id);

    const response = await fetch(ORION_URL + "/" + entity.id + "/attrs", {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
    });

    if (!response.ok) {
        console.log("Response body:", await response.text());
        throw new Error(`HTTP error! status: ${response.status}`);
    } else {
        console.log("Entity updated successfully");
    }
}

//create ngsi entity from weather data
async function createNgsiEntity(data, entityId) {
    formattedDateTime = await getLocalTime(data.coord.lat, data.coord.lon);
    
    ngsi_entity = {
        "id": entityId,
        "type": "WeatherObserved",
        "temperature": {
            "type": "Property",
            "value": data.main.temp - 273.15
        },
        "weather_icon": {
            "type": "Property",
            "value": data.weather[0].icon
        },
        "weather": {
            "type": "Property",
            "value": data.weather[0].main
        },
        "description": {
            "type": "Property",
            "value": data.weather[0].description
        },
        "dateTimeObserved": {
            "type": "Property",
            "value": data.dt
        },
        "feels_like": {
            "type": "Property",
            "value": data.main.feels_like - 273.15
        },
        "temp_min": {
            "type": "Property",
            "value": data.main.temp_min - 273.15
        },
        "temp_max": {
            "type": "Property",
            "value": data.main.temp_max - 273.15
        },
        "pressure": {
            "type": "Property",
            "value": data.main.pressure
        },
        "humidity": {
            "type": "Property",
            "value": data.main.humidity
        },
        "wind_speed": {
            "type": "Property",
            "value": data.wind.speed
        },
        "visibility": {
            "type": "Property",
            "value": data.visibility
        },
        "lat": {
            "type": "Property",
            "value": data.coord.lat
        },
        "lon": {
            "type": "Property",
            "value": data.coord.lon
        },
        "formattedDateTime": {
            "type": "Property",
            "value": formattedDateTime
        }

    }

    return ngsi_entity;
}

//using timeapi to get local time
async function getLocalTime(lat, lon) {
    try {
        const response = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let formattedDateTime = data.dayOfWeek + " " + data.day + " " + month[data.month] + " " + data.year + ", " + data.time;
        return formattedDateTime;
    } catch (error) {
        console.error('Error fetching time data:', error);
    }
}


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
