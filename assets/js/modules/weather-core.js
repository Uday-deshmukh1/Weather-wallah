import Capitals from "../Capitals.js";
import { translations, getUserLanguage } from "../../../lang/translation.js";
import config from "../config/app-config.js";
import { toastFunction } from "./toast.js";
import { updateMapView } from "./map.js";

const userLang = getUserLanguage() || "en-US";
let isCelcius = true;
let selectedCity;

function formatAMPM(date) {
  return date.toLocaleString(translations[userLang].formattingLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AirQuality = (city) => {
  fetchAirQuality(city)
    .then((aqi) => updateAirQuality(aqi))
    .catch(() => {
      fetchAirQualityFeed(city)
        .then((aqi) => updateAirQuality(aqi))
        .catch((error) => handleAirQualityError(error, city));
    });
};

const fetchAirQuality = (city) => {
  const url = `https://api.waqi.info/v2/search/?token=${config.AIR_KEY}&keyword=${encodeURIComponent(city)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  return fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } })
    .then((res) => {
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("AQI_NETWORK_ERROR");
      return res.json();
    })
    .then((data) => {
      if (!data || data.status !== "ok" || !data.data || !Array.isArray(data.data) || data.data.length === 0) throw new Error("AQI_NO_DATA");
      for (const station of data.data) {
        const aqi = Number(station.aqi);
        if (!isNaN(aqi) && aqi > 0) return aqi;
      }
      throw new Error("AQI_INVALID_DATA");
    })
    .catch((error) => { clearTimeout(timeoutId); throw error; });
};

const fetchAirQualityFeed = (city) => {
  const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${config.AIR_KEY}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  return fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } })
    .then((res) => {
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("AQI_FEED_ERROR");
      return res.json();
    })
    .then((data) => {
      if (!data || data.status !== "ok" || !data.data) throw new Error("AQI_NO_DATA");
      const aqi = Number(data.data.aqi);
      if (isNaN(aqi) || aqi <= 0) throw new Error("AQI_INVALID_DATA");
      return aqi;
    })
    .catch((error) => { clearTimeout(timeoutId); throw error; });
};

const handleAirQualityError = (error, city) => {
  const airQualityElement = document.querySelector("#AirQuality");
  const qualityDescriptionElement = document.querySelector(".air-quality-label");
  const fallbackMessage = translations[userLang].notAvailable || "N/A";
  if (airQualityElement) airQualityElement.innerText = fallbackMessage;
  if (qualityDescriptionElement) {
    qualityDescriptionElement.innerText = translations[userLang].notAvailable || "Not Available";
    qualityDescriptionElement.classList = "air-quality-label ml-0 not-available";
  }
  console.warn("Air Quality Error for", city, ":", error.message);
};

const updateAirQuality = (aqi) => {
  const airQualityElement = document.querySelector("#AirQuality");
  if (airQualityElement) airQualityElement.innerText = `${aqi}`;
  const airQuality = getAirQualityDescription(aqi, userLang);
  const textClass = getAirQualityClass(aqi);
  const qualityDescriptionElement = document.querySelector(".air-quality-label");
  if (qualityDescriptionElement) {
    qualityDescriptionElement.innerText = airQuality;
    qualityDescriptionElement.classList = "air-quality-label ml-0 " + textClass;
  }
};

const getAirQualityDescription = (aqi, userLang) => {
  switch (true) {
    case aqi >= 0 && aqi <= 50: return `${translations[userLang].good}`;
    case aqi > 50 && aqi <= 100: return `${translations[userLang].satisfactory}`;
    case aqi > 100 && aqi <= 150: return `${translations[userLang].sensitive}`;
    case aqi > 150 && aqi <= 200: return `${translations[userLang].unhealthy}`;
    case aqi > 200 && aqi <= 300: return `${translations[userLang].veryUnhealthy}`;
    case aqi > 300: return `${translations[userLang].hazardous}`;
    default: return `${translations[userLang].notAvailable}`;
  }
};

const getAirQualityClass = (aqi) => {
  switch (true) {
    case aqi >= 0 && aqi <= 50: return "good-quality";
    case aqi > 50 && aqi <= 100: return "satisfactory-quality";
    case aqi > 100 && aqi <= 150: return "sensitive-quality";
    case aqi > 150 && aqi <= 200: return "unhealthy-quality";
    case aqi > 200 && aqi <= 300: return "very-unhealthy-quality";
    case aqi > 300: return "hazardous-quality";
    default: return "not-available";
  }
};

const weather = {
  _photoInterval: null,

  fetchWeather: function (city = null, lat = null, lon = null) {
    let url;
    const lang = (translations[userLang] && translations[userLang].apiLang) || "en";

    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${config.API_KEY}&lang=${lang}`;
    } else {
      let isCountry = false;
      let index;
      for (let i = 0; i < Capitals.length; i++) {
        if (Capitals[i].country.toUpperCase() === city.toUpperCase()) {
          isCountry = true; index = i; break;
        }
      }
      if (isCountry) city = Capitals[index].city;
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${config.API_KEY}&lang=${lang}`;
    }

    this.showLoadingState();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const self = this;

    fetch(url, { signal: controller.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          switch (response.status) {
            case 401: throw new Error("API_KEY_INVALID");
            case 404: throw new Error("CITY_NOT_FOUND");
            case 429: throw new Error("RATE_LIMIT_EXCEEDED");
            case 500: case 502: case 503: throw new Error("SERVER_ERROR");
            default: throw new Error("NETWORK_ERROR");
          }
        }
        return response.json();
      })
      .then((data) => {
        if (!data || !data.main || !data.weather || !data.weather[0]) throw new Error("INVALID_DATA");
        self.hideLoadingState();
        const tempEl = document.getElementById("temp");
        if (tempEl) tempEl.style.display = "block";
        self.displayWeather(data, city);
        self.fetch24hForecast(data.coord.lat, data.coord.lon);
        self.fetch7DayForecast(data.coord.lat, data.coord.lon);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        self.hideLoadingState();
        self.handleWeatherError(error, city);
      });
  },

  fetch24hForecast: function (lat, lon) {
    const ticker = document.getElementById("forecast-ticker");
    if (!ticker) return;

    const lang = (translations[userLang] && translations[userLang].apiLang) || "en";
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${config.API_KEY}&lang=${lang}&cnt=8`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    fetch(url, { signal: controller.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("Forecast fetch failed");
        return response.json();
      })
      .then((data) => {
        if (!data || !data.list || data.list.length === 0) {
          ticker.innerHTML = `<div class="forecast-error">No forecast data available</div>`;
          return;
        }
        this.renderForecastTicker(data.list);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.warn("24h forecast fetch failed:", error.message);
        ticker.innerHTML = `<div class="forecast-error">Forecast unavailable</div>`;
      });
  },

  renderForecastTicker: function (items) {
    const ticker = document.getElementById("forecast-ticker");
    if (!ticker) return;

    ticker.innerHTML = "";

    items.forEach((item, idx) => {
      const itemTime = new Date(item.dt * 1000);
      const isNow = idx === 0;
      const timeLabel = isNow ? "Now" : itemTime.toLocaleTimeString(translations[userLang].formattingLocale, { hour: "numeric", hour12: true });
      const temp = Math.round(item.main.temp);
      const icon = item.weather[0].icon;

      const el = document.createElement("div");
      el.className = `forecast-item${isNow ? " now" : ""}`;
      el.innerHTML = `
        <div class="forecast-time">${timeLabel}</div>
        <div class="forecast-icon"><img src="https://openweathermap.org/img/wn/${icon}.png" alt="${item.weather[0].description}" /></div>
        <div class="forecast-temp">${temp}°</div>
      `;
      ticker.appendChild(el);
    });
  },

  fetch7DayForecast: function (lat, lon) {
    const container = document.getElementById("forecast-week");
    if (!container) return;

    const lang = (translations[userLang] && translations[userLang].apiLang) || "en";
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${config.API_KEY}&lang=${lang}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    fetch(url, { signal: controller.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("Forecast fetch failed");
        return response.json();
      })
      .then((data) => {
        if (!data || !data.list || data.list.length === 0) {
          container.innerHTML = `<div class="forecast-error">No forecast data available</div>`;
          return;
        }
        const daily = this.aggregateDailyForecast(data.list);
        this.render7DayForecast(daily);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.warn("7-day forecast fetch failed:", error.message);
        container.innerHTML = `<div class="forecast-error">Forecast unavailable</div>`;
      });
  },

  aggregateDailyForecast: function (list) {
    const dayMap = {};
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toISOString().split("T")[0];

      if (!dayMap[dateStr]) {
        dayMap[dateStr] = {
          date: date,
          dayName: dayNames[date.getDay()],
          temps: [],
          icons: [],
          descriptions: [],
          humidity: [],
        };
      }

      dayMap[dateStr].temps.push(item.main.temp);
      dayMap[dateStr].icons.push(item.weather[0].icon);
      dayMap[dateStr].descriptions.push(item.weather[0].description);
      dayMap[dateStr].humidity.push(item.main.humidity);
    });

    const today = new Date().toISOString().split("T")[0];
    const result = [];
    const seen = {};

    for (const key of Object.keys(dayMap)) {
      if (seen[key]) continue;
      seen[key] = true;

      const day = dayMap[key];
      const avgTemp = Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length);
      const maxTemp = Math.round(Math.max(...day.temps));
      const minTemp = Math.round(Math.min(...day.temps));

      const iconCounts = {};
      day.icons.forEach((ic) => { iconCounts[ic] = (iconCounts[ic] || 0) + 1; });
      const mainIcon = Object.keys(iconCounts).reduce((a, b) => iconCounts[a] > iconCounts[b] ? a : b);

      const descCounts = {};
      day.descriptions.forEach((d) => { descCounts[d] = (descCounts[d] || 0) + 1; });
      const mainDesc = Object.keys(descCounts).reduce((a, b) => descCounts[a] > descCounts[b] ? a : b);

      let label;
      if (key === today) {
        label = "Today";
      } else {
        label = day.dayName.substring(0, 3);
      }

      result.push({
        label,
        icon: mainIcon,
        description: mainDesc,
        avgTemp,
        maxTemp,
        minTemp,
        humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      });

      if (result.length >= 7) break;
    }

    return result;
  },

  render7DayForecast: function (days) {
    const container = document.getElementById("forecast-week");
    if (!container) return;

    container.innerHTML = "";

    days.forEach((day) => {
      const el = document.createElement("div");
      el.className = "forecast-day";
      el.innerHTML = `
        <span class="forecast-day-name">${day.label}</span>
        <img class="forecast-day-icon" src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}" />
        <span class="forecast-day-desc">${day.description}</span>
        <div class="forecast-day-temps">
          <span class="forecast-day-hi">${day.maxTemp}°</span>
          <span class="forecast-day-lo">${day.minTemp}°</span>
        </div>
      `;
      container.appendChild(el);
    });
  },

  getWeatherIcon: function (iconCode) {
    const iconMap = {
      "01d": "fa-sun", "01n": "fa-moon", "02d": "fa-cloud-sun", "02n": "fa-cloud-moon",
      "03d": "fa-cloud", "03n": "fa-cloud", "04d": "fa-cloud", "04n": "fa-cloud",
      "09d": "fa-cloud-showers-heavy", "09n": "fa-cloud-showers-heavy",
      "10d": "fa-cloud-sun-rain", "10n": "fa-cloud-moon-rain",
      "11d": "fa-bolt", "11n": "fa-bolt", "13d": "fa-snowflake", "13n": "fa-snowflake",
      "50d": "fa-smog", "50n": "fa-smog",
    };
    return iconMap[iconCode] || "fa-question-circle";
  },

  getUVIndexDescription: function (uvi) {
    if (uvi <= 2) return { text: "Low", tip: "No protection needed.", className: "uvi-low" };
    if (uvi <= 5) return { text: "Moderate", tip: "Sunscreen recommended.", className: "uvi-moderate" };
    if (uvi <= 7) return { text: "High", tip: "Wear a hat and sunglasses.", className: "uvi-high" };
    if (uvi <= 10) return { text: "Very High", tip: "Seek shade during midday.", className: "uvi-very-high" };
    return { text: "Extreme", tip: "Avoid being outside.", className: "uvi-extreme" };
  },

  updateUVIndex: function (uvi) {
    const uviValueElement = document.getElementById("uvi");
    const uviTextElement = document.getElementById("uvi-text");
    const uviGridItem = document.getElementById("metric-uvi");
    if (uviValueElement && uviTextElement && uviGridItem) {
      const uviValue = Math.round(uvi);
      const { text, tip, className } = this.getUVIndexDescription(uviValue);
      uviValueElement.textContent = uviValue;
      uviTextElement.textContent = `${text} - ${tip}`;
      uviGridItem.classList.remove("uvi-low", "uvi-moderate", "uvi-high", "uvi-very-high", "uvi-extreme");
      uviGridItem.classList.add(className);
    }
  },

  updateLastUpdated: function () {
    const now = new Date();
    const timeString = now.toLocaleTimeString(translations[userLang].formattingLocale, { hour: "2-digit", minute: "2-digit" });
    const lastUpdatedElement = document.getElementById("last-updated");
    if (lastUpdatedElement) lastUpdatedElement.textContent = `Last updated at ${timeString}`;
  },

  displayWeather: function (data, city) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity, feels_like, temp_min, temp_max, pressure } = data.main;
    const { speed } = data.wind;
    const { sunrise, sunset } = data.sys;
    const visibility = data.visibility;
    let date1 = new Date(sunrise * 1000);
    let date2 = new Date(sunset * 1000);
    const { lat, lon } = data.coord;

    try { AirQuality(city || name); } catch (aqError) { console.warn("Air Quality fetch failed:", aqError); }

    setTimeout(() => {
      if (window._weatherAlerts) window._weatherAlerts.checkWeatherConditions(data, isCelcius);
    }, 1000);

    const weatherCard = document.querySelector(".current-weather-card");
    const isNight = icon.includes("n");
    if (weatherCard) {
      weatherCard.classList.toggle("night", isNight);
      weatherCard.classList.toggle("day", !isNight);
    }

    document.title = `Weather Wallah — ${name}`;

    const cityEl = document.getElementById("city");
    if (cityEl) cityEl.innerText = name;

    updateMapView(lat, lon, name);

    const iconElement = document.getElementById("icon");
    if (iconElement) iconElement.className = `fas ${this.getWeatherIcon(icon)} weather-main-icon`;

    const descEl = document.getElementById("description");
    if (descEl) descEl.innerText = description;

    const tempElement = document.getElementById("temp");
    if (tempElement) {
      tempElement.style.transition = "all 0.4s ease-in-out";
      let temperature = temp;
      if (!isCelcius) {
        temperature = temperature * (9 / 5) + 32;
        temperature = Math.round(temperature) + "°F";
      } else {
        temperature = temperature + "°C";
      }
      tempElement.innerText = temperature;
    }

    const feelsLikeEl = document.getElementById("feels-like");
    if (feelsLikeEl) {
      let feels = feels_like;
      if (!isCelcius) {
        feels = (feels * 9 / 5 + 32).toFixed(0);
        feelsLikeEl.innerText = feels + "°F";
      } else {
        feelsLikeEl.innerText = Math.round(feels) + "°C";
      }
    }

    const hiTempEl = document.getElementById("hi-temp");
    const loTempEl = document.getElementById("lo-temp");
    if (hiTempEl) {
      let hi = temp_max;
      let lo = temp_min;
      if (!isCelcius) {
        hi = Math.round(hi * 9 / 5 + 32);
        lo = Math.round(lo * 9 / 5 + 32);
      } else {
        hi = Math.round(hi);
        lo = Math.round(lo);
      }
      hiTempEl.innerText = hi;
      if (loTempEl) loTempEl.innerText = lo;
    }

    const humidityEl = document.getElementById("humidity");
    if (humidityEl) humidityEl.innerText = `${humidity}%`;

    const windEl = document.getElementById("wind");
    if (windEl) windEl.innerText = `${speed} km/h`;

    const pressureEl = document.getElementById("pressure");
    if (pressureEl) pressureEl.innerText = `${pressure} hPa`;

    const visibilityEl = document.getElementById("visibility");
    if (visibilityEl) {
      const visKm = (visibility / 1000).toFixed(1);
      visibilityEl.innerText = `${visKm} km`;
    }

    const weatherEl = document.getElementById("weather");
    if (weatherEl) weatherEl.classList.remove("loading");

    const sunriseEl = document.getElementById("sunrise");
    if (sunriseEl) sunriseEl.innerText = formatAMPM(date1);

    const sunsetEl = document.getElementById("sunset");
    if (sunsetEl) sunsetEl.innerText = formatAMPM(date2);

    this.updateLastUpdated();

    // Save to recent searches
    this.addToRecentSearches(name);
  },

  addToRecentSearches: function (cityName) {
    try {
      let recent = JSON.parse(localStorage.getItem("weather-recent-searches") || "[]");
      recent = recent.filter((c) => c.toLowerCase() !== cityName.toLowerCase());
      recent.unshift(cityName);
      if (recent.length > 8) recent = recent.slice(0, 8);
      localStorage.setItem("weather-recent-searches", JSON.stringify(recent));
    } catch (e) {}
  },

  getRecentSearches: function () {
    try {
      return JSON.parse(localStorage.getItem("weather-recent-searches") || "[]");
    } catch (e) {
      return [];
    }
  },

  search: async function (query) {
    const searchBar = document.querySelector(".weather-component__search-bar");
    const searchValue = query || (searchBar && searchBar.value);

    if (searchValue && searchValue.trim() !== "") {
      selectedCity = searchValue.trim();
      this.fetchWeather(selectedCity);
      if (searchBar) searchBar.value = selectedCity;
    } else {
      toastFunction(translations[userLang].pleaseAddLocation, "warning", 3000);
    }
  },

  showLoadingState: function () {
    const weatherElement = document.getElementById("weather");
    const cityElement = document.getElementById("city");
    const tempElement = document.getElementById("temp");
    if (weatherElement) weatherElement.classList.add("loading");
    if (cityElement) cityElement.innerHTML = translations[userLang].loading || "Loading weather data...";
    if (tempElement) tempElement.style.display = "none";
  },

  hideLoadingState: function () {
    const weatherElement = document.getElementById("weather");
    if (weatherElement) weatherElement.classList.remove("loading");
  },

  handleWeatherError: function (error, city) {
    const cityElement = document.getElementById("city");
    const tempElement = document.getElementById("temp");
    const dataWrapper = document.querySelector(".metric-grid");

    if (tempElement) tempElement.style.display = "none";

    let errorMessage;
    let toastType = "error";

    switch (error.message) {
      case "API_KEY_INVALID":
        errorMessage = translations[userLang].apiKeyInvalid || "Invalid API key. Please check configuration.";
        if (cityElement) cityElement.innerHTML = "Configuration Error";
        break;
      case "CITY_NOT_FOUND":
        errorMessage = translations[userLang].noWeatherFound || "City not found. Please check spelling.";
        if (cityElement) cityElement.innerHTML = "City Not Found";
        break;
      case "RATE_LIMIT_EXCEEDED":
        errorMessage = translations[userLang].rateLimitExceeded || "Too many requests. Please try again later.";
        if (cityElement) cityElement.innerHTML = "Rate Limit Exceeded";
        toastType = "warning";
        break;
      case "SERVER_ERROR":
        errorMessage = translations[userLang].serverError || "Weather service temporarily unavailable.";
        if (cityElement) cityElement.innerHTML = "Service Unavailable";
        break;
      case "INVALID_DATA":
        errorMessage = translations[userLang].invalidData || "Received invalid weather data.";
        if (cityElement) cityElement.innerHTML = "Data Error";
        break;
      default:
        if (error.name === "AbortError") {
          errorMessage = translations[userLang].requestTimeout || "Request timed out.";
          if (cityElement) cityElement.innerHTML = "Connection Timeout";
        } else {
          errorMessage = translations[userLang].networkError || "Network error.";
          if (cityElement) cityElement.innerHTML = "Network Error";
        }
    }

    toastFunction(errorMessage, toastType, 6000);
  },
};

export { weather, isCelcius, selectedCity, userLang };
