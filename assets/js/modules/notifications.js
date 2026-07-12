export class SmartNotifications {
  constructor() {
    this.userPreferences = this.loadUserPreferences();
    this.setupNotificationSystem();
  }

  loadUserPreferences() {
    return JSON.parse(localStorage.getItem("weatherPreferences")) || {
      notificationsEnabled: false,
      preferredActivities: ["outdoor", "sports", "photography"],
      temperatureRange: { min: 15, max: 25 },
    };
  }

  saveUserPreferences() {
    localStorage.setItem("weatherPreferences", JSON.stringify(this.userPreferences));
  }

  setupNotificationSystem() {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            this.userPreferences.notificationsEnabled = true;
            this.saveUserPreferences();
            this.scheduleSmartNotifications();
          }
        });
      }
    }
  }

  scheduleSmartNotifications() {
    setInterval(() => { this.checkForOptimalConditions(); }, 60000 * 30);
  }

  checkForOptimalConditions() {
    if (this.userPreferences.notificationsEnabled && Math.random() > 0.9) {
      this.sendSmartNotification(
        "🌟 Perfect Weather Alert!",
        "Current conditions are ideal for outdoor photography. Golden hour starts in 2 hours!"
      );
    }
  }

  sendSmartNotification(title, body) {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "./assets/weather-icon.png", badge: "./assets/weather-icon.png" });
    }
  }
}
