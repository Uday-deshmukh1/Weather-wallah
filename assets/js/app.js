import CITY from "./City.js";
import { weather, userLang } from "./modules/weather-core.js";
import { toastFunction } from "./modules/toast.js";
import { WeatherAlerts } from "./modules/weather-alerts.js";
import { NetworkMonitor } from "./modules/network-monitor.js";
import { VoiceWeatherCommands } from "./modules/voice-commands.js";
import { SmartNotifications } from "./modules/notifications.js";
import { initParticleNetwork } from "./modules/particles.js";

const weatherAlerts = new WeatherAlerts();
window._weatherAlerts = weatherAlerts;
new NetworkMonitor();

// ===== POPULATE DATALIST =====
const place = document.querySelector("#place");
if (place) {
  for (let i in CITY) {
    let option = document.createElement("option");
    option.value = CITY[i];
    option.text = CITY[i];
    place.appendChild(option);
  }
}

// ===== SEARCH HANDLERS =====
function handleSearch(query) {
  if (query && query.trim()) {
    weather.search(query.trim());
  }
}

document.querySelector("#search-btn")?.addEventListener("click", function () {
  const val = document.querySelector(".weather-component__search-bar")?.value;
  handleSearch(val);
});

document.querySelector(".weather-component__search-bar")?.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    handleSearch(this.value);
  }
});

// ===== NAVIGATION / TABS =====
function initNavigation() {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const panel = tab.dataset.panel;
      const panels = document.querySelectorAll(".panel");
      panels.forEach((p) => p.classList.remove("panel-active"));

      const targetPanel = document.getElementById(`${panel}-panel`);
      if (targetPanel) targetPanel.classList.add("panel-active");
    });
  });
}

// ===== CLOCK =====
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function updateClock() {
  const a = new Date();
  const dt = document.getElementById("date-time");
  const dt2 = document.getElementById("date-time2");
  if (dt) dt.innerHTML = weekday[a.getDay()] + "  " + a.getDate() + "  " + month[a.getMonth()] + " " + a.getFullYear();
  if (dt2) {
    let hours = a.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    dt2.innerHTML = String(hours).padStart(2, "0") + ":" +
      String(a.getMinutes()).padStart(2, "0") + ":" +
      String(a.getSeconds()).padStart(2, "0") + " " + ampm;
  }
}

// ===== SCROLL TO TOP =====
function initScrollTop() {
  const scrollBtn = document.getElementById("scroll-btn");
  if (!scrollBtn) return;
  window.addEventListener("scroll", function () {
    window.scrollY > window.innerHeight ? scrollBtn.classList.add("show") : scrollBtn.classList.remove("show");
  });
  scrollBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
}

// ===== LOCATION & WEATHER =====
function initLocationAndWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => { weather.fetchWeather(null, position.coords.latitude, position.coords.longitude); },
      (error) => {
        let msg = error.code === error.PERMISSION_DENIED
          ? translations[userLang].permissionDenied
          : translations[userLang].locationError;
        toastFunction(msg, "error", 5000);
        weather.fetchWeather("London");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  } else {
    toastFunction(translations[userLang].notSupported, "error", 5000);
    weather.fetchWeather("London");
  }
}

// ===== THEME MANAGER =====
let themeManager = null;
function initThemeManager() {
  try {
    themeManager = new ThemeManager();
    document.addEventListener("themeChanged", (e) => {
      console.log("Theme changed to:", e.detail.theme);
    });
  } catch (error) { console.error("Failed to initialize Theme Manager:", error); }
}

// ===== SUGGESTIONS: WHAT TO WEAR & WHAT TO EAT =====
function updateMoodRecommendations() {
  const weatherDesc = document.getElementById("description")?.textContent?.toLowerCase() || "";
  const tempText = document.getElementById("temp")?.textContent || "";
  const temp = parseFloat(tempText.replace("°C", "").replace("°F", "")) || 0;

  const recommendations = generateSmartRecommendations(weatherDesc, temp);
  displayMoodRecommendations(recommendations);
}

function generateSmartRecommendations(weather, temp) {
  const recommendations = [];

  // ===== WHAT TO WEAR =====
  if (temp > 35) {
    recommendations.push({
      icon: "👔", title: "What to Wear",
      description: "Lightweight cotton clothing, loose-fit shirts, shorts, sandals. Wear a wide-brim hat and UV-protective sunglasses. Choose light-colored fabrics that reflect heat.",
      tag: "wear"
    });
  } else if (temp > 28) {
    recommendations.push({
      icon: "👔", title: "What to Wear",
      description: "Breathable linen or cotton t-shirts, shorts or light pants, and comfortable sneakers. A light cap or visor helps. Avoid heavy layers.",
      tag: "wear"
    });
  } else if (temp > 20) {
    recommendations.push({
      icon: "👔", title: "What to Wear",
      description: "A light t-shirt with a thin jacket or cardigan. Jeans or chinos with casual shoes work perfectly. Carry a light layer for cooler evenings.",
      tag: "wear"
    });
  } else if (temp > 10) {
    recommendations.push({
      icon: "👔", title: "What to Wear",
      description: "Layer up with a sweater or hoodie over a long-sleeve shirt. Wear jeans, closed shoes, and a light jacket. A scarf is a nice addition.",
      tag: "wear"
    });
  } else {
    recommendations.push({
      icon: "👔", title: "What to Wear",
      description: "Bundle up in a warm coat, thermal layers, wool sweater, gloves, and a beanie. Wear insulated boots and thick socks to stay cozy.",
      tag: "wear"
    });
  }

  // ===== WHAT TO EAT =====
  if (temp > 30) {
    recommendations.push({
      icon: "🍽️", title: "What to Eat",
      description: "Stay hydrated with coconut water, fresh lime soda, or cold soups. Enjoy fruit salads, ice cream, smoothie bowls, cold pasta salads, or chilled curd rice.",
      tag: "eat"
    });
  } else if (temp > 22) {
    recommendations.push({
      icon: "🍽️", title: "What to Eat",
      description: "Perfect weather for light meals. Try fresh salads, grilled sandwiches, sushi, poke bowls, or a refreshing fruit platter with mint.",
      tag: "eat"
    });
  } else if (temp > 12) {
    recommendations.push({
      icon: "🍽️", title: "What to Eat",
      description: "Warm comfort foods like soup, ramen, pasta, or a hot cup of chai with pakoras. A warm stew or baked casserole hits the spot on a cool day.",
      tag: "eat"
    });
  } else {
    recommendations.push({
      icon: "🍽️", title: "What to Eat",
      description: "Go for hot chocolate, hearty soup, dal-rice, parathas, or a warm bowl of oatmeal. Nothing beats a hot meal when it's freezing outside.",
      tag: "eat"
    });
  }

  // ===== WEATHER-BASED ACTIVITIES =====
  if (weather.includes("sunny") || weather.includes("clear")) {
    recommendations.push({
      icon: "☀️", title: "Perfect For",
      description: "Great day for a walk, cycling, outdoor photos, or a picnic. Don't forget sunscreen and water!"
    });
  } else if (weather.includes("rain") || weather.includes("drizzle")) {
    recommendations.push({
      icon: "☔", title: "Stay Dry",
      description: "Carry an umbrella and wear waterproof footwear. Perfect day for indoor activities like reading or gaming."
    });
  } else if (weather.includes("cloud")) {
    recommendations.push({
      icon: "📸", title: "Great for Photos",
      description: "Overcast skies give soft, diffused light — ideal for outdoor photography and scenic walks."
    });
  } else if (weather.includes("thunder") || weather.includes("storm")) {
    recommendations.push({
      icon: "⚠️", title: "Stay Safe",
      description: "Stay indoors during storms. Avoid open areas and tall structures. Keep your phone charged for emergencies."
    });
  } else {
    recommendations.push({
      icon: "🌿", title: "Enjoy the Day",
      description: "Moderate weather — a great time for a casual stroll or outdoor activity."
    });
  }

  return recommendations;
}

function displayMoodRecommendations(recommendations) {
  const container = document.getElementById("mood-recommendations");
  if (!container) return;

  container.innerHTML = recommendations.map(rec => `
    <div class="mood-item${rec.tag ? ' mood-item-' + rec.tag : ''}">
      <span class="mood-icon">${rec.icon}</span>
      <div class="mood-title">${rec.title}</div>
      <div class="mood-description">${rec.description}</div>
    </div>
  `).join("");
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const animatedEls = document.querySelectorAll(".animate-on-scroll");
  if (!animatedEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animatedEls.forEach((el) => observer.observe(el));
}

// Re-trigger animations when About tab is opened
function watchAboutTab() {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.panel === "about") {
        setTimeout(() => {
          document.querySelectorAll("#about-panel .animate-on-scroll").forEach((el, i) => {
            el.classList.remove("visible");
            setTimeout(() => el.classList.add("visible"), i * 80);
          });
        }, 100);
      }
    });
  });
}

// ===== INITIALIZE =====
function initializeApp() {
  initParticleNetwork();
  initScrollTop();
  initNavigation();
  initScrollAnimations();
  watchAboutTab();

  setInterval(updateClock, 1000);
  updateClock();

  initLocationAndWeather();

  const voiceCommands = new VoiceWeatherCommands(weather);
  window._voiceCommands = voiceCommands;

  new SmartNotifications();

  // Watch for weather description changes to update suggestions
  const observer = new MutationObserver(() => {
    const desc = document.getElementById("description");
    if (desc && desc.textContent && desc.textContent !== "___") {
      updateMoodRecommendations();
    }
  });
  const descEl = document.getElementById("description");
  if (descEl) {
    observer.observe(descEl, { childList: true, characterData: true, subtree: true });
  }

  console.log("Weather Wallah initialized");
}

document.addEventListener("DOMContentLoaded", initializeApp);
