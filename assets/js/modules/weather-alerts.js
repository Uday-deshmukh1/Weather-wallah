export class WeatherAlerts {
  constructor() {
    this.alertsContainer = document.getElementById("weather-alerts");
    this.safetyModal = document.getElementById("safety-modal-overlay");
    this.safetyModalContent = document.getElementById("safety-modal-content");
    this.closeModalBtn = document.getElementById("close-safety-modal");
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener("click", () => this.closeSafetyModal());
    }
    if (this.safetyModal) {
      this.safetyModal.addEventListener("click", (e) => {
        if (e.target === this.safetyModal) this.closeSafetyModal();
      });
    }
  }

  checkWeatherConditions(weatherData, isCelcius) {
    if (!this.alertsContainer) return;
    const alerts = [];
    const { main, wind } = weatherData;
    const temp = isCelcius ? main.temp : (main.temp * 9) / 5 + 32;
    const humidity = main.humidity;
    const windSpeed = wind.speed;

    const airQualityElement = document.querySelector("#AirQuality");
    const aqiText = airQualityElement ? airQualityElement.innerText : "";
    const aqi = aqiText && aqiText !== "--" && aqiText !== "N/A" ? parseInt(aqiText) : null;

    if (isCelcius) {
      if (temp > 40) alerts.push({ type: "critical", icon: "🔥", title: "Extreme Heat Warning", message: `Temperature: ${temp.toFixed(1)}°C - Stay indoors and hydrate frequently` });
      else if (temp > 35) alerts.push({ type: "warning", icon: "🌡️", title: "High Temperature Alert", message: `Temperature: ${temp.toFixed(1)}°C - Limit outdoor activities` });
      else if (temp < -10) alerts.push({ type: "critical", icon: "🥶", title: "Extreme Cold Warning", message: `Temperature: ${temp.toFixed(1)}°C - Risk of frostbite` });
    } else {
      if (temp > 104) alerts.push({ type: "critical", icon: "🔥", title: "Extreme Heat Warning", message: `Temperature: ${temp.toFixed(1)}°F - Stay indoors and hydrate frequently` });
      else if (temp > 95) alerts.push({ type: "warning", icon: "🌡️", title: "High Temperature Alert", message: `Temperature: ${temp.toFixed(1)}°F - Limit outdoor activities` });
      else if (temp < 14) alerts.push({ type: "critical", icon: "🥶", title: "Extreme Cold Warning", message: `Temperature: ${temp.toFixed(1)}°F - Risk of frostbite` });
    }

    if (windSpeed > 20) alerts.push({ type: "critical", icon: "💨", title: "High Wind Warning", message: `Wind Speed: ${windSpeed} km/h - Avoid outdoor activities` });
    else if (windSpeed > 15) alerts.push({ type: "warning", icon: "🌬️", title: "Moderate Wind Alert", message: `Wind Speed: ${windSpeed} km/h - Exercise caution outdoors` });

    if (aqi && !isNaN(aqi)) {
      if (aqi > 200) alerts.push({ type: "critical", icon: "🏭", title: "Poor Air Quality", message: `AQI: ${aqi} - Stay indoors, avoid outdoor exercise` });
      else if (aqi > 150) alerts.push({ type: "warning", icon: "😷", title: "Unhealthy Air Quality", message: `AQI: ${aqi} - Consider wearing a mask outdoors` });
      else if (aqi > 100) alerts.push({ type: "moderate", icon: "⚠️", title: "Moderate Air Quality", message: `AQI: ${aqi} - Sensitive individuals should limit outdoor activities` });
    }

    if (humidity > 80) alerts.push({ type: "moderate", icon: "💧", title: "High Humidity", message: `Humidity: ${humidity}% - May feel uncomfortable` });

    this.displayAlerts(alerts);
  }

  displayAlerts(alerts) {
    this.alertsContainer.innerHTML = "";
    alerts.forEach((alert, index) => {
      const alertElement = document.createElement("div");
      alertElement.className = `weather-alert ${alert.type}`;
      alertElement.setAttribute("role", "alert");
      alertElement.innerHTML = `
        <div class="alert-header">
          <span class="alert-icon">${alert.icon}</span>
          <span>${alert.title}</span>
        </div>
        <div class="alert-message">${alert.message}</div>`;
      alertElement.addEventListener("click", () => this.showSafetyTips(alert.type));
      setTimeout(() => { this.alertsContainer.appendChild(alertElement); }, index * 200);
    });
  }

  showSafetyTips(alertType) {
    if (!this.safetyModal || !this.safetyModalContent) return;
    const tips = this.getSafetyTips(alertType);
    this.safetyModalContent.innerHTML = tips.map(tip => `
      <div class="safety-tip">
        <div class="safety-tip-title">${tip.title}</div>
        <div class="safety-tip-text">${tip.text}</div>
      </div>`).join("");
    this.safetyModal.style.display = "flex";
  }

  getSafetyTips(alertType) {
    const tipsByType = {
      critical: [
        { title: "🏠 Stay Indoors", text: "Avoid prolonged outdoor exposure during extreme weather conditions." },
        { title: "💧 Stay Hydrated", text: "Drink plenty of water even if you don't feel thirsty." },
        { title: "👕 Appropriate Clothing", text: "Wear light-colored, loose-fitting clothes in heat or layer up in cold." },
        { title: "📱 Emergency Contacts", text: "Keep emergency numbers handy and inform someone of your whereabouts." },
      ],
      warning: [
        { title: "⏰ Limit Outdoor Time", text: "Reduce time spent outdoors, especially during peak hours." },
        { title: "🧴 Use Protection", text: "Apply sunscreen, wear protective clothing, or use appropriate gear." },
        { title: "🚗 Safe Travel", text: "Exercise extra caution when driving or walking outdoors." },
      ],
      moderate: [
        { title: "👂 Stay Informed", text: "Monitor weather conditions and be prepared for changes." },
        { title: "🩺 Health Awareness", text: "Pay attention to how you feel and take breaks as needed." },
        { title: "📋 Plan Ahead", text: "Adjust outdoor plans based on current conditions." },
      ],
    };
    return tipsByType[alertType] || tipsByType.moderate;
  }

  closeSafetyModal() {
    if (this.safetyModal) this.safetyModal.style.display = "none";
  }
}
