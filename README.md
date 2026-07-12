# 🌤️ Weather Wallah

**Your Simple Weather Companion**

Weather Wallah is a clean, fast, glassmorphism-styled weather dashboard that goes beyond basic forecasts. Along with live weather data, it gives you an interactive satellite map, air quality index, and smart suggestions on what to wear, eat, and do — all in one place, with no ads, no clutter, and no tracking.

---

## ✨ Features

- 🌡️ **Live weather data** — real-time temperature, humidity, wind speed, UV index, and pressure
- ⏱️ **24-hour forecast** — horizontal scrollable ticker with hourly predictions
- 📅 **7-day forecast** — daily high/low temperatures with weather icons
- 🗺️ **Satellite map** — interactive Leaflet.js map with ArcGIS satellite tiles and a location pin
- 💨 **Air quality index** — live AQI data from the WAQI API with color-coded labels
- 🌅 **Sunrise & sunset** — daily sun times with visual icons
- 👕 **What to wear** — temperature-based clothing recommendations
- 🍲 **What to eat** — weather-appropriate food suggestions
- 🚶 **Activity suggestions** — smart tips based on current weather conditions
- 🎙️ **Voice search** — search cities using your microphone
- 📍 **Auto location detection** — detects your location automatically on first visit
- 🌑 **Dark mode only** — beautiful glassmorphism dark UI
- 📱 **Mobile responsive** — fixed bottom navbar on mobile, top navbar on desktop
- ⚠️ **Weather alerts** — automatic alerts for extreme weather conditions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure and markup |
| CSS3 | Styling with glassmorphism design |
| JavaScript ES6 | Core logic, modules, API calls |
| Bootstrap | Grid utilities and base styles |
| Gulp | Development server with live reload |
| [OpenWeatherMap API](https://openweathermap.org/api) | Weather data, forecasts, UV index |
| [WAQI API](https://aqicn.org/api/) | Air quality index data |
| Leaflet.js + ArcGIS | Interactive satellite map |
| Font Awesome 6 | Icons throughout the UI |
| Google Fonts (Inter) | Clean modern typography |

---

## 📂 Project Structure

```
weather-app-uday/
├── index.html                  # Main entry point
├── gulpfile.js                 # Dev server configuration
├── package.json                # Dependencies and scripts
├── .env                        # API keys (private, git-ignored)
├── .env.example                # Template for API keys
├── .gitignore                  # Git ignore rules
├── LICENSE                     # License file
│
├── assets/
│   ├── css/
│   │   ├── main.css            # All component styles
│   │   ├── theme.css           # Dark mode theme variables
│   │   └── bootstrap.min.css   # Bootstrap framework
│   │
│   ├── js/
│   │   ├── app.js              # Main app initialization
│   │   ├── env-config.js       # API key configuration
│   │   ├── City.js             # City names database
│   │   ├── Capitals.js         # Country-capital mappings
│   │   ├── config/
│   │   │   └── app-config.js   # API config export
│   │   └── modules/
│   │       ├── weather-core.js     # Weather API logic
│   │       ├── map.js              # Leaflet map handling
│   │       ├── toast.js            # Toast notifications
│   │       ├── weather-alerts.js   # Weather alerts
│   │       ├── voice-commands.js   # Voice search
│   │       ├── notifications.js    # Smart notifications
│   │       ├── network-monitor.js  # Network status
│   │       └── particles.js        # Background particles
│   │
│   ├── icons/
│   │   └── logo.png            # App logo
│   ├── favicon.ico             # Browser tab icon
│   └── weather-icon.png        # Weather notification icon
│
└── lang/
    └── translation.js          # Multi-language support
```

---

## ⚙️ How It Works

1. **User searches a city or allows location** — type any city name in the search bar, or allow browser location access; the app automatically detects your coordinates.
2. **APIs fetch live data** — OpenWeatherMap provides real-time temperature, humidity, wind speed, UV index, sunrise/sunset, and forecast data; WAQI provides live air quality index; Leaflet.js + ArcGIS renders an interactive satellite map with a pin at the location.
3. **Data is rendered beautifully** — all data is displayed in clean glass cards: current weather, 24-hour ticker, 7-day forecast, map with location pin, and metric cards for humidity, wind, UV, and air quality.
4. **Smart suggestions are generated** — based on temperature and weather conditions, the app suggests:
   - **What to wear** — from light cotton clothes (hot) to warm layers (cold)
   - **What to eat** — from cold smoothies (hot) to hot soup and chai (cold)
   - **Activities** — a walk for sunny days, indoor time for storms, photography for cloudy skies

---

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine
- Free API keys from:
  - [OpenWeatherMap](https://openweathermap.org/api)
  - [WAQI Air Quality API](https://aqicn.org/api/)

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Uday-deshmukh1/weather-app-uday.git

# Navigate to the project
cd weather-app-uday

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000` (or the next available port).

---

## 🔑 API Keys Setup

1. Copy `.env.example` to `.env`
2. Get free API keys from:
   - **OpenWeatherMap**: https://openweathermap.org/api
   - **WAQI Air Quality**: https://aqicn.org/api/
3. Add your keys to `.env`:
   ```
   WEATHER_API_KEY=your_key_here
   AIR_QUALITY_API_KEY=your_key_here
   ```
4. Update `assets/js/env-config.js` with the same keys

> **Note:** `.env` and `env-config.js` are git-ignored to keep your API keys private.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start the development server with live reload |
| `npm run dev` | Same as start |

---

## 📱 Layout

**Desktop (> 768px)**
- Navbar fixed at the top center (max-width 900px)
- Single column layout for weather content
- 2-column grid for the About section

**Mobile (≤ 768px)**
- Navbar fixed at the bottom for easy thumb access
- Single column layout throughout
- Touch-friendly tap targets
- Scrollable forecast ticker

---

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 🏆 Why Weather Wallah?

Most weather apps just show temperature and forecast. Weather Wallah goes further:

1. **Complete guidance** — not just weather, but what to wear, what to eat, and what to do
2. **Clean design** — no ads, no clutter, just a beautiful glassmorphism interface
3. **Built-in map** — no need to open a separate map app
4. **Air quality data** — know how safe the air is to breathe
5. **Mobile first** — bottom navigation, fast loading, works smoothly on any device
6. **Voice search** — search hands-free using your microphone
7. **Private** — no tracking, no analytics, your data stays on your device

---

## 👤 Author

**Uday Deshmukh** — UI/UX Designer & Frontend Developer

- 🌐 [Portfolio](https://udaydeshmukh.pages.dev)
- 💼 [LinkedIn](https://www.linkedin.com/in/uday-deshmukh-b8170a397)
- 🐙 [GitHub](https://github.com/Uday-deshmukh1)
- 📸 [Instagram](https://www.instagram.com/uday_deshmukh.i)
- ✉️ [Email](mailto:udaydeshmukh266@gmail.com)

---

## 📄 License

Copyright (c) 2026 Uday Deshmukh. All Rights Reserved.

This project and all its contents — including source code, design, and assets — are the intellectual property of Uday Deshmukh. No part of it may be reproduced or distributed without prior written permission. See the [LICENSE](./LICENSE) file for full details, or contact udaydeshmukh266@gmail.com for permission requests.
