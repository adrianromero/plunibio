(() => {
  const viewer = document.querySelector("[data-image-viewer]");
  const viewerImage = viewer?.querySelector("[data-image-viewer-image]");
  const closeButton = viewer?.querySelector("[data-image-viewer-close]");
  const triggers = document.querySelectorAll("[data-image-viewer-trigger]");

  if (!viewer || !viewerImage || !closeButton || triggers.length === 0) {
    return;
  }

  let lastTrigger = null;

  const closeViewer = () => {
    viewer.hidden = true;
    document.body.classList.remove("image-viewer-open");
    viewerImage.removeAttribute("src");
    viewerImage.alt = "";
    lastTrigger?.focus();
  };

  const openViewer = (trigger) => {
    const sourceImage = trigger.querySelector("img");

    if (!sourceImage) {
      return;
    }

    lastTrigger = trigger;
    viewerImage.src = sourceImage.currentSrc || sourceImage.src;
    viewerImage.alt = sourceImage.alt;
    viewer.hidden = false;
    document.body.classList.add("image-viewer-open");
    closeButton.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openViewer(trigger));
  });

  closeButton.addEventListener("click", closeViewer);
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) {
      closeViewer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !viewer.hidden) {
      closeViewer();
    }

    if (event.key === "Tab" && !viewer.hidden) {
      event.preventDefault();
      closeButton.focus();
    }
  });
})();
