export class NetworkMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
    this.createNetworkStatusIndicator();
  }

  setupEventListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.hideNetworkStatus();
    });
    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.showNetworkStatus();
    });
  }

  createNetworkStatusIndicator() {
    const indicator = document.createElement("div");
    indicator.id = "network-status";
    indicator.className = "network-status";
    indicator.innerHTML = `<i class="fas fa-wifi"></i><span>No internet connection</span>`;
    document.body.appendChild(indicator);
  }

  showNetworkStatus() {
    const indicator = document.getElementById("network-status");
    if (indicator) indicator.classList.add("show");
  }

  hideNetworkStatus() {
    const indicator = document.getElementById("network-status");
    if (indicator) indicator.classList.remove("show");
  }

  isConnected() { return this.isOnline; }
}
