(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const previousButton = document.getElementById("previous-button");
  const nextButton = document.getElementById("next-button");
  const counter = document.getElementById("slide-counter");
  const titleLabel = document.getElementById("slide-title");
  const sectionLabel = document.getElementById("section-label");
  const progressBar = document.getElementById("progress-bar");
  const themeButton = document.getElementById("theme-button");
  const themeColor = document.getElementById("theme-color");
  const fullscreenButton = document.getElementById("fullscreen-button");
  const helpButton = document.getElementById("help-button");
  const helpDialog = document.getElementById("help-dialog");
  const lightboxDialog = document.getElementById("lightbox-dialog");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxViewport = document.getElementById("lightbox-viewport");
  const zoomLabel = document.getElementById("zoom-label");
  const panHint = document.getElementById("pan-hint");
  const zoomLevels = [1, 1.35, 1.75, 2.25, 3, 4];
  let zoomIndex = 0;
  let currentIndex = 0;
  let touchStartX = null;
  let dragState = null;

  function applyTheme(theme, persist = true) {
    const nextTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    const isLight = nextTheme === "light";
    themeButton.textContent = isLight ? "☾" : "☀";
    themeButton.setAttribute("aria-label", isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
    themeButton.setAttribute("aria-pressed", String(isLight));
    themeColor.content = isLight ? "#f4f7fb" : "#07111f";
    if (persist) {
      try { localStorage.setItem("deep-clustering-theme", nextTheme); } catch (_) {}
    }
  }

  applyTheme(document.documentElement.dataset.theme, false);
  themeButton.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"));

  function indexFromHash() {
    const requestedId = window.location.hash.replace(/^#/, "");
    if (!requestedId) return 0;
    const requestedIndex = slides.findIndex((slide) => slide.id === requestedId);
    return requestedIndex >= 0 ? requestedIndex : 0;
  }

  function stopAllAudio() {
    document.querySelectorAll("audio").forEach((audio) => {
      audio.pause();
      const player = audio.closest("[data-audio-player]");
      const button = player && player.querySelector(".play-button");
      if (button) {
        button.textContent = "▶";
        button.setAttribute("aria-label", button.getAttribute("aria-label").replace("Pausar", "Reproducir"));
      }
    });
  }

  function showSlide(index, options = {}) {
    const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
    if (nextIndex !== currentIndex) stopAllAudio();
    currentIndex = nextIndex;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.toggleAttribute("inert", !active);
    });

    const activeSlide = slides[currentIndex];
    const heading = activeSlide.querySelector("h1, h2");
    counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    titleLabel.textContent = heading ? heading.textContent.trim() : "Presentación";
    sectionLabel.textContent = activeSlide.dataset.section || "";
    progressBar.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
    const backgroundNumber = activeSlide.querySelector(".slide-number");
    if (backgroundNumber) backgroundNumber.textContent = String(currentIndex + 1).padStart(2, "0");
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;
    previousButton.setAttribute("aria-disabled", String(previousButton.disabled));
    nextButton.setAttribute("aria-disabled", String(nextButton.disabled));

    const hash = `#${activeSlide.id}`;
    if (window.location.hash !== hash) history.replaceState(null, "", hash);
    document.title = `${String(currentIndex + 1).padStart(2, "0")} · ${heading ? heading.textContent.trim() : "Deep Clustering"}`;
    activeSlide.scrollTop = 0;
    if (options.focus && heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }

  function move(delta) { showSlide(currentIndex + delta, { focus: false }); }

  previousButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));
  document.querySelectorAll("[data-go='next']").forEach((button) => button.addEventListener("click", () => move(1)));

  window.addEventListener("hashchange", () => showSlide(indexFromHash()));
  document.addEventListener("keydown", (event) => {
    if (document.querySelector("dialog[open]")) return;
    const target = event.target;
    if (target instanceof HTMLButtonElement || target instanceof HTMLInputElement || target instanceof HTMLAudioElement || target?.getAttribute?.("role") === "slider") return;
    if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); move(1); }
    if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); move(-1); }
    if (event.key === "Home") { event.preventDefault(); showSlide(0); }
    if (event.key === "End") { event.preventDefault(); showSlide(slides.length - 1); }
    if (event.key.toLowerCase() === "f") toggleFullscreen();
    if (event.key.toLowerCase() === "t") applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
  });

  document.getElementById("deck").addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  document.getElementById("deck").addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 70) move(distance < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {
      fullscreenButton.title = "El navegador no permitió pantalla completa";
    }
  }
  fullscreenButton.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "×" : "⛶";
    fullscreenButton.setAttribute("aria-label", document.fullscreenElement ? "Salir de pantalla completa" : "Activar pantalla completa");
  });

  helpButton.addEventListener("click", () => helpDialog.showModal());
  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  });

  document.querySelectorAll("[data-lightbox]").forEach((button) => {
    button.addEventListener("click", () => {
      lightboxImage.src = button.dataset.lightbox;
      const sourceImage = button.querySelector("img");
      lightboxImage.alt = sourceImage ? sourceImage.alt : "Imagen ampliada";
      setLightboxZoom(0, { resetScroll: true });
      lightboxDialog.showModal();
    });
  });

  function updatePanState() {
    const canPan = lightboxViewport.scrollWidth > lightboxViewport.clientWidth + 2 || lightboxViewport.scrollHeight > lightboxViewport.clientHeight + 2;
    lightboxViewport.classList.toggle("can-pan", canPan && zoomIndex > 0);
    panHint.hidden = !(canPan && zoomIndex > 0);
  }

  function setLightboxZoom(nextIndex, options = {}) {
    const relativeX = (lightboxViewport.scrollLeft + lightboxViewport.clientWidth / 2) / Math.max(lightboxViewport.scrollWidth, lightboxViewport.clientWidth, 1);
    const relativeY = (lightboxViewport.scrollTop + lightboxViewport.clientHeight / 2) / Math.max(lightboxViewport.scrollHeight, lightboxViewport.clientHeight, 1);
    zoomIndex = Math.max(0, Math.min(zoomLevels.length - 1, nextIndex));
    const zoom = zoomLevels[zoomIndex];
    lightboxImage.style.width = `${zoom * 100}%`;
    zoomLabel.value = `${Math.round(zoom * 100)} %`;
    zoomLabel.textContent = zoomLabel.value;
    lightboxDialog.querySelector("[data-zoom-out]").disabled = zoomIndex === 0;
    lightboxDialog.querySelector("[data-zoom-in]").disabled = zoomIndex === zoomLevels.length - 1;
    requestAnimationFrame(() => {
      const left = options.resetScroll || zoomIndex === 0 ? 0 : relativeX * lightboxViewport.scrollWidth - lightboxViewport.clientWidth / 2;
      const top = options.resetScroll || zoomIndex === 0 ? 0 : relativeY * lightboxViewport.scrollHeight - lightboxViewport.clientHeight / 2;
      lightboxViewport.scrollTo({ left: Math.max(0, left), top: Math.max(0, top), behavior: "auto" });
      updatePanState();
    });
  }

  lightboxDialog.querySelector("[data-zoom-in]").addEventListener("click", () => setLightboxZoom(zoomIndex + 1));
  lightboxDialog.querySelector("[data-zoom-out]").addEventListener("click", () => setLightboxZoom(zoomIndex - 1));
  lightboxDialog.querySelector("[data-zoom-reset]").addEventListener("click", () => setLightboxZoom(0));
  lightboxDialog.addEventListener("keydown", (event) => {
    if (["+", "="].includes(event.key)) { event.preventDefault(); setLightboxZoom(zoomIndex + 1); }
    if (event.key === "-") { event.preventDefault(); setLightboxZoom(zoomIndex - 1); }
    if (event.key === "0") { event.preventDefault(); setLightboxZoom(0); }
  });
  lightboxImage.addEventListener("load", updatePanState);
  lightboxImage.addEventListener("dragstart", (event) => event.preventDefault());
  lightboxViewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !lightboxViewport.classList.contains("can-pan")) return;
    dragState = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: lightboxViewport.scrollLeft, top: lightboxViewport.scrollTop };
    lightboxViewport.classList.add("is-dragging");
    lightboxViewport.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  lightboxViewport.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    lightboxViewport.scrollLeft = dragState.left - (event.clientX - dragState.x);
    lightboxViewport.scrollTop = dragState.top - (event.clientY - dragState.y);
    event.preventDefault();
  });
  function finishImageDrag(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    dragState = null;
    lightboxViewport.classList.remove("is-dragging");
    if (lightboxViewport.hasPointerCapture(event.pointerId)) lightboxViewport.releasePointerCapture(event.pointerId);
  }
  lightboxViewport.addEventListener("pointerup", finishImageDrag);
  lightboxViewport.addEventListener("pointercancel", finishImageDrag);
  window.addEventListener("resize", updatePanState);

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  document.querySelectorAll("[data-audio-player]").forEach((player) => {
    const audio = player.querySelector("audio");
    const playButton = player.querySelector(".play-button");
    const progress = player.querySelector(".audio-progress");
    const fill = progress.querySelector("span");
    const time = player.querySelector("time");
    const initialLabel = playButton.getAttribute("aria-label");

    function setPosition(ratio) {
      if (!Number.isFinite(audio.duration)) return;
      audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
    }

    playButton.addEventListener("click", () => {
      const shouldPlay = audio.paused;
      stopAllAudio();
      if (shouldPlay) audio.play().catch(() => {});
    });
    audio.addEventListener("play", () => { playButton.textContent = "Ⅱ"; playButton.setAttribute("aria-label", initialLabel.replace("Reproducir", "Pausar")); });
    audio.addEventListener("pause", () => { playButton.textContent = "▶"; playButton.setAttribute("aria-label", initialLabel); });
    audio.addEventListener("ended", () => { audio.currentTime = 0; });
    audio.addEventListener("timeupdate", () => {
      const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      fill.style.width = `${ratio * 100}%`;
      progress.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
      time.textContent = formatTime(audio.currentTime);
    });
    progress.addEventListener("click", (event) => {
      const rect = progress.getBoundingClientRect();
      setPosition((event.clientX - rect.left) / rect.width);
    });
    progress.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Home") setPosition(0);
      else if (event.key === "End") setPosition(1);
      else audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + (event.key === "ArrowRight" ? 1 : -1)));
    });
  });

  const comparisonButtons = document.querySelectorAll("[data-source]");
  const realSpectrum = document.getElementById("real-spectrum");
  const estimatedSpectrum = document.getElementById("estimated-spectrum");
  const realLabel = document.getElementById("real-label");
  const estimatedLabel = document.getElementById("estimated-label");
  comparisonButtons.forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.source;
    const data = window.PRESENTATION_DATA.comparisons[key];
    comparisonButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    realSpectrum.src = data.real;
    realSpectrum.alt = data.realAlt;
    estimatedSpectrum.src = data.estimated;
    estimatedSpectrum.alt = data.estimatedAlt;
    realLabel.textContent = data.realLabel;
    estimatedLabel.textContent = data.estimatedLabel;
    realSpectrum.closest("[data-lightbox]").dataset.lightbox = data.real;
    estimatedSpectrum.closest("[data-lightbox]").dataset.lightbox = data.estimated;
  }));

  const thresholdButtons = document.querySelectorAll("[data-threshold]");
  thresholdButtons.forEach((button) => button.addEventListener("click", () => {
    const threshold = button.dataset.threshold;
    const data = window.PRESENTATION_DATA.thresholds[threshold];
    thresholdButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    document.getElementById("coverage-value").textContent = data.coverage;
    document.getElementById("improvement-value").textContent = data.improvement;
    document.getElementById("positive-value").textContent = data.positive;
    document.getElementById("threshold-note").textContent = `Conserva ${data.retained} mezclas. El umbral es una referencia empírica, no una garantía universal.`;
  }));

  document.querySelectorAll("[data-replay]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetSelector = button.dataset.replay;
      const target = button.closest(".slide").querySelector(targetSelector);
      if (!target) return;
      target.classList.add("animation-reset");
      void target.offsetWidth;
      target.classList.remove("animation-reset");
    });
  });

  showSlide(indexFromHash());
})();
