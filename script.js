//Globally Scoped Variables 
const searchBtn = document.querySelector(".searchBtn");
const cityInput = document.querySelector(".city-input");
const searchHistory = document.querySelector("#searchHistory");
const weatherCardContainer = document.querySelector(".weather-cards");
const API_KEY = "5ee40e0816c136937ce4d351f3932343"; //API key for URL

// Function to create a weather card
const createWeatherCard = (weatherItem) => {
  //puts weather card as a list item in the ul card containers. Linking my created card headers with the corresponding information pulled from the API calls
  return `<li class="card">
    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}C</h4>
    <h4>Wind: ${weatherItem.wind.speed}</h4>
    <h4>Humidity: ${weatherItem.main.humidity}</h4>
  </li>`;
};

// Function to get forecast details through latitude and longitude
const getForecastDetails = (cityName, lat, lon) => {
  const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
//fetch call made for the forecast
  fetch(FORECAST_API_URL)
    .then((res) => res.json())
    .then((data) => {
      //creating a variable for the array that is pulled from the fetch call. 
      const currentForecastDays = [];
      //goes through fetch data and filters for forecast information
      const currentForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!currentForecastDays.includes(forecastDate)) {
          return currentForecastDays.push(forecastDate);
        }
      });

      //makes the user search input value a string
      cityInput.value = "";
      weatherCardContainer.innerHTML = "";

      console.log(currentForecast);
      //puts the forecast date in the weather card
      currentForecast.forEach((weatherItem) => {
        weatherCardContainer.insertAdjacentHTML("beforeend", createWeatherCard(weatherItem));
      });
    })
    .catch(() => {
      //If the above fails to work, this error will pop up
      alert("Having trouble fetching the forecast!");
    });
};

// Function to get coordinates by city name and linking them with the lat and lon values from the previous fetch call
const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;

  const geoCoding_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(geoCoding_API_URL)
    .then((res) => res.json())
    .then((data) => {
      // if statement to match up the previous fetch call of latitude and longitude with the city name entered
      if (!data.length) return alert(`Cannot find coordinates for ${cityName}`);
      const { name, lat, lon } = data[0];
      getForecastDetails(name, lat, lon);

      //saves user entry into local storage
      localStorage.setItem("cityName", cityName);
      console.log(cityName);

      // Save cityName to searchHistory
      const searchItem = document.createElement("button");
      searchItem.textContent = cityName;
      searchItem.classList.add("searchItem");
      searchHistory.appendChild(searchItem);

      // Add click event listener to searchItem
      searchItem.addEventListener("click", () => {
        getForecastDetails(name, lat, lon);
      });
    })
    .catch(() => {
      //Will appear if the above does not work
      alert("Having trouble fetching coordinates!");
    });
};

//search button function that starts the api fetch call functions above.
searchBtn.addEventListener("click", () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  getCityCoordinates(cityName);
});

// Get cityName from local storage and add it to searchHistory.
const cityName = localStorage.getItem("cityName");
if (cityName) {
  //Puts search item into an li element
  const searchItem = document.createElement("li");
  searchItem.textContent = cityName;
  searchHistory.appendChild(searchItem);

  // Add click event listener to searchItem for the previously searched saved city entries. Does the fetch call again through clicking the previous search entry.
  searchItem.addEventListener("click", () => {
    getCityCoordinates(cityName);
  });
}