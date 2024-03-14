function fetchWeather(city, countryShort) {
    //clear error message if any
    document.getElementById('error-message').textContent = '';

    fetch(`/weather?city=${city}&countryShort=${countryShort}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const temperature = (data.temperature.value).toFixed(2); // convert from Kelvin to Celsius
            const feelsLike = (data.feels_like.value).toFixed(2);
            const weather = data.weather.value;
            const description = data.description.value.charAt(0).toUpperCase() + data.description.value.slice(1);
            const tempMin = (data.temp_min.value).toFixed(2);
            const tempMax = (data.temp_max.value).toFixed(2);
            const pressure = data.pressure.value;
            const humidity = data.humidity.value;
            const windSpeed = data.wind_speed.value;
            const visibility = data.visibility.value;
            const weatherIcon = data.weather_icon.value;
            const formattedDateTime = data.formattedDateTime.value;

            map.setView([data.lat.value, data.lon.value], 10);

            document.getElementById('weather-icon').src = `http://openweathermap.org/img/w/${weatherIcon}.png`;
            document.getElementById('weather-title').textContent = city;
            document.getElementById('weather-date').textContent = `Local time: ${formattedDateTime}`;
            document.getElementById('weather-description').textContent = `${description}`;
            document.getElementById('weather-temperature').textContent = `${temperature}°C`;
            document.getElementById('weather-feels-like').textContent = `Feels like ${feelsLike}°C`;
            document.getElementById('weather-min-max-temp').textContent = `Expect highs of ${tempMax}°C and lows around ${tempMin}°C`;
            document.getElementById('weather-pressure').textContent = `Pressure: ${pressure} hPa`;
            document.getElementById('weather-humidity').textContent = `Humidity: ${humidity}%`;
            document.getElementById('weather-wind-speed').textContent = `Wind Speed: ${windSpeed} m/s`;
            document.getElementById('weather-visibility').textContent = `Visibility: ${visibility / 1000} km`;

            document.getElementById('weather-info').style.display = 'block';
            document.getElementById('custom-country-code').style.display = 'none';
            document.getElementById('country-select').style.display = 'block';
            document.getElementById('city-input').value = '';
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            document.getElementById('error-message').textContent = 'Error fetching weather data, Make sure the city exists.';
        });
}


document.getElementById('search-button').addEventListener('click', () => {
    checkCityAndFetch();
});

document.getElementById('city-input').addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        checkCityAndFetch();
    }
});

document.getElementById('countryListed').addEventListener('click', () => {
    document.getElementById('custom-country-code').style.display = 'block';
    document.getElementById('country-select').style.display = 'none';
});

// function to check if the city input is empty else fetch the weather
function checkCityAndFetch() {
    const costomCode = document.getElementById('custom-country-code').value.trim();
    let countryShort = "";
    if (costomCode !== '') {
        countryShort = costomCode.toUpperCase();
        document.getElementById('custom-country-code').value = "";
    } else {
        countryShort = document.getElementById('country-select').value;
    }

    const city = document.getElementById('city-input').value.trim();

    if (city !== '') {
        fetchWeather(city, countryShort);
    } else {
        document.getElementById('error-message').textContent = 'Please enter a city';
    }
}


let map = L.map('map').setView([48.2085, 16.3721], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);