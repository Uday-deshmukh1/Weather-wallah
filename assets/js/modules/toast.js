export function toastFunction(message, type = "info", duration = 4000) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const toastClose = document.getElementById("toast-close");

  if (!toast || !toastMessage || !toastClose) {
    console.error("Toast elements not found in DOM");
    console.log(`Toast ${type.toUpperCase()}: ${message}`);
    return;
  }

  if (toast.hideTimeout) {
    clearTimeout(toast.hideTimeout);
    toast.hideTimeout = null;
  }

  toastMessage.textContent = message;
  toast.classList.remove("error", "success", "warning", "info");
  toast.classList.add("show");
  if (type && typeof type === "string") toast.classList.add(type);

  toast.setAttribute("aria-hidden", "false");
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const previouslyFocused = document.activeElement;
  try {
    toast.setAttribute("tabindex", "-1");
    toast.focus({ preventScroll: true });
  } catch (e) {}

  toast.hideTimeout = setTimeout(() => {
    hideToast();
  }, duration);

  toastClose.onclick = null;
  toastClose.addEventListener(
    "click",
    function onCloseClick(e) {
      e.preventDefault();
      if (toast.hideTimeout) {
        clearTimeout(toast.hideTimeout);
        toast.hideTimeout = null;
      }
      hideToast();
    },
    { once: true }
  );

  function hideToast() {
    toast.classList.remove("show");
    toast.classList.add("hide");

    setTimeout(() => {
      toast.className = "toast";
      toast.setAttribute("aria-hidden", "true");
      try { toast.removeAttribute("tabindex"); } catch (e) {}
      if (toast.hideTimeout) {
        clearTimeout(toast.hideTimeout);
        toast.hideTimeout = null;
      }
      try { if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus(); } catch (e) {}
    }, 300);
  }
}
