import { toastFunction } from "./toast.js";

export class VoiceWeatherCommands {
  constructor(weather) {
    this.weather = weather;
    this.recognition = null;
    this.isListening = false;
    this.setupVoiceRecognition();
    this.setupEventListeners();
  }

  setupVoiceRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";
    }
  }

  setupEventListeners() {
    const micBtn = document.getElementById("microphone-button");
    const voiceStatus = document.getElementById("voice-status");

    if (micBtn && this.recognition) {
      micBtn.addEventListener("click", () => this.toggleListening());

      this.recognition.onstart = () => {
        this.isListening = true;
        micBtn.classList.add("listening");
        if (voiceStatus) {
          voiceStatus.textContent = 'Listening... Try "Weather in Paris" or "Will it rain tomorrow?"';
          voiceStatus.classList.add("show");
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        micBtn.classList.remove("listening");
        if (voiceStatus) voiceStatus.classList.remove("show");
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        this.processVoiceCommand(transcript);
      };

      this.recognition.onerror = (event) => {
        console.warn("Voice recognition error:", event.error);
        if (voiceStatus) {
          voiceStatus.textContent = "Voice recognition failed. Please try again.";
          setTimeout(() => voiceStatus.classList.remove("show"), 2000);
        }
      };
    } else if (micBtn) {
      micBtn.addEventListener("click", () => {
        toastFunction("Voice recognition is not supported in this browser.", "warning", 3000);
      });
    }
  }

  toggleListening() {
    if (!this.recognition) return;
    if (this.isListening) {
      try { this.recognition.stop(); } catch (e) { /* ignore */ }
    } else {
      try { this.recognition.start(); } catch (e) { /* ignore */ }
    }
  }

  processVoiceCommand(transcript) {
    const cityPatterns = [
      /weather in ([a-zA-Z\s]+)/,
      /what's the weather in ([a-zA-Z\s]+)/,
      /how's the weather in ([a-zA-Z\s]+)/,
      /temperature in ([a-zA-Z\s]+)/,
      /forecast for ([a-zA-Z\s]+)/,
    ];

    for (const pattern of cityPatterns) {
      const match = transcript.match(pattern);
      if (match) {
        const city = match[1].trim();
        const searchBar = document.querySelector(".weather-component__search-bar");
        if (searchBar) searchBar.value = city;
        this.weather.fetchWeather(city);
        toastFunction(`Searching weather for ${city}...`);
        return;
      }
    }

    if (transcript.includes("rain") || transcript.includes("sunny") || transcript.includes("cloudy")) {
      toastFunction("Please specify a city for weather information!");
    } else {
      toastFunction('Try asking "What\'s the weather in [city name]?"');
    }
  }
}
