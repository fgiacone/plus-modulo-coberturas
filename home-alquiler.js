const previewModes = {
  mobile: { width: "390px", height: "1070px" },
  tablet: { width: "768px", height: "1070px" },
  desktop: { width: "1920px", height: "1070px" },
};

const MIN_PREVIEW_WIDTH = 350;
const MAX_PREVIEW_WIDTH = 1920;
const KEYBOARD_RESIZE_STEP = 16;
const FIXED_PREVIEW_HEIGHT = 1000;

const previewCanvas = document.querySelector("[data-preview-canvas]");
const previewFrame = document.querySelector("[data-preview-frame]");
const previewIframe = document.querySelector("[data-preview-iframe]");
const previewResizeHandle = document.querySelector("[data-resize-handle]");
const previewWidthValue = document.querySelector("[data-preview-width-value]");
const previewButtons = document.querySelectorAll("[data-preview-mode]");
let previewResizeRaf = 0;

function clampWidth(width) {
  return Math.min(MAX_PREVIEW_WIDTH, Math.max(MIN_PREVIEW_WIDTH, Math.round(width)));
}

function getModeFromWidth(width) {
  if (width <= 750) {
    return "mobile";
  }

  if (width <= 991) {
    return "tablet";
  }

  return "desktop";
}

function updateResizeHandle(width) {
  if (!previewResizeHandle) {
    return;
  }

  const valueNow = Math.max(25, Math.round((width / MAX_PREVIEW_WIDTH) * 100));
  previewResizeHandle.setAttribute("aria-valuenow", String(valueNow));
}

function updateWidthIndicator(width) {
  if (previewWidthValue) {
    previewWidthValue.textContent = `${Math.round(width)}px`;
  }
}

function syncPreviewButtons(activeMode) {
  previewButtons.forEach((button) => {
    const isActive = button.dataset.previewMode === activeMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function resizePreviewIframe() {
  setPreviewIframeHeight(FIXED_PREVIEW_HEIGHT);
}

function setPreviewIframeHeight(height) {
  if (!previewIframe) {
    return;
  }

  const nextHeight = Math.max(FIXED_PREVIEW_HEIGHT, Math.round(Number(height) || 0));
  previewIframe.style.height = `${nextHeight}px`;
  previewIframe.style.minHeight = "0";

  if (previewResizeHandle) {
    previewResizeHandle.style.height = `${nextHeight}px`;
    previewResizeHandle.style.minHeight = "0";
  }
}

function schedulePreviewIframeResize() {
  window.cancelAnimationFrame(previewResizeRaf);
  previewResizeRaf = window.requestAnimationFrame(() => {
    resizePreviewIframe();
    window.setTimeout(resizePreviewIframe, 260);
  });
}

function setPreviewWidth(width, options = {}) {
  const nextWidth = clampWidth(width);

  if (previewFrame) {
    previewFrame.dataset.currentView = getModeFromWidth(nextWidth);
    previewFrame.style.width = `${nextWidth}px`;
  }

  updateResizeHandle(nextWidth);
  updateWidthIndicator(nextWidth);
  syncPreviewButtons(options.mode || getModeFromWidth(nextWidth));
  schedulePreviewIframeResize();
}

function setPreviewMode(mode) {
  const nextMode = previewModes[mode] ? mode : "desktop";
  const settings = previewModes[nextMode];
  const width = Number.parseInt(settings.width, 10);

  setPreviewWidth(width, { height: settings.height, mode: nextMode });
}

function startResize(event) {
  if (!previewFrame || !previewCanvas || !previewResizeHandle) {
    return;
  }

  event.preventDefault();
  previewCanvas.classList.add("is-resizing");
  previewResizeHandle.dataset.resizeHandleState = "active";
  previewResizeHandle.setPointerCapture?.(event.pointerId);

  const frameLeft = previewFrame.getBoundingClientRect().left;

  function resize(moveEvent) {
    setPreviewWidth(moveEvent.clientX - frameLeft);
  }

  function stopResize(upEvent) {
    previewCanvas.classList.remove("is-resizing");
    previewResizeHandle.dataset.resizeHandleState = "inactive";
    previewResizeHandle.releasePointerCapture?.(upEvent.pointerId);
    window.removeEventListener("pointermove", resize);
    window.removeEventListener("pointerup", stopResize);
    window.removeEventListener("pointercancel", stopResize);
  }

  window.addEventListener("pointermove", resize);
  window.addEventListener("pointerup", stopResize);
  window.addEventListener("pointercancel", stopResize);
}

function resizeWithKeyboard(event) {
  if (!previewFrame) {
    return;
  }

  const currentWidth = previewFrame.getBoundingClientRect().width;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setPreviewWidth(currentWidth - KEYBOARD_RESIZE_STEP);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    setPreviewWidth(currentWidth + KEYBOARD_RESIZE_STEP);
  }

  if (event.key === "Home") {
    event.preventDefault();
    setPreviewWidth(MIN_PREVIEW_WIDTH);
  }

  if (event.key === "End") {
    event.preventDefault();
    setPreviewWidth(MAX_PREVIEW_WIDTH);
  }
}

previewButtons.forEach((button) => {
  button.addEventListener("click", () => setPreviewMode(button.dataset.previewMode));
});

previewIframe?.addEventListener("load", schedulePreviewIframeResize);
previewResizeHandle?.addEventListener("pointerdown", startResize);
previewResizeHandle?.addEventListener("keydown", resizeWithKeyboard);
window.addEventListener("resize", schedulePreviewIframeResize);
window.addEventListener("message", (event) => {
  if (event.data?.type === "ok-home-resize") {
    window.requestAnimationFrame(resizePreviewIframe);
  }
});

setPreviewMode("desktop");
