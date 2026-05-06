const scene = document.getElementById("logoScene");
const logo = document.getElementById("logo");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let lastInputAt = 0;
let sensorInputAt = 0;
let rafId = null;

function applyTransform() {
  currentX += (targetX - currentX) * 0.11;
  currentY += (targetY - currentY) * 0.11;

  const rotateX = -currentY * 10;
  const rotateY = currentX * 13;
  const moveX = currentX * 30;
  const moveY = currentY * 22;

  if (logo && logo.style) {
    logo.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  rafId = requestAnimationFrame(applyTransform);
}

function updateByPointer(clientX, clientY) {
  const rect = scene.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width;
  const y = (clientY - rect.top) / rect.height;

  targetX = (x - 0.5) * 2;
  targetY = (y - 0.5) * 2;
  lastInputAt = Date.now();
}

window.addEventListener("pointermove", (event) => {
  updateByPointer(event.clientX, event.clientY);
});

window.addEventListener("pointerleave", () => {
  targetX = 0;
  targetY = 0;
});

window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    updateByPointer(touch.clientX, touch.clientY);
  },
  { passive: true }
);

function bindDeviceOrientation() {
  if (!window.DeviceOrientationEvent) {
    return;
  }

  window.addEventListener("deviceorientation", (event) => {
    const gamma = event.gamma ?? 0;
    const beta = event.beta ?? 0;

    // Clamp values to keep movement expressive but controlled.
    targetX = Math.max(-1, Math.min(1, gamma / 28));
    targetY = Math.max(-1, Math.min(1, beta / 36));
    lastInputAt = Date.now();
    sensorInputAt = Date.now();
  });
}

function bindDeviceMotion() {
  if (!window.DeviceMotionEvent) {
    return;
  }

  window.addEventListener("devicemotion", (event) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) {
      return;
    }

    // Fallback mapping for Android browsers where orientation can be unreliable.
    const x = acc.x ?? 0;
    const y = acc.y ?? 0;

    targetX = Math.max(-1, Math.min(1, x / 7));
    targetY = Math.max(-1, Math.min(1, -y / 9));
    lastInputAt = Date.now();
    sensorInputAt = Date.now();
  });
}

async function setupMobileMotion() {
  if (!window.DeviceOrientationEvent && !window.DeviceMotionEvent) {
    return;
  }

  if (
    window.DeviceOrientationEvent &&
    typeof DeviceOrientationEvent.requestPermission !== "function"
  ) {
    bindDeviceOrientation();
    bindDeviceMotion();
    return;
  }

  const askPermission = async () => {
    try {
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
        const state = await DeviceOrientationEvent.requestPermission();
        if (state === "granted") {
          bindDeviceOrientation();
        }
      }

      if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") {
        const state = await DeviceMotionEvent.requestPermission();
        if (state === "granted") {
          bindDeviceMotion();
        }
      } else {
        bindDeviceMotion();
      }

      if (Date.now() - sensorInputAt > 3000) {
        bindDeviceOrientation();
        bindDeviceMotion();
      }
    } catch (_error) {
      // Keep graceful fallback if user denies permission.
    }
  };

  // iOS only allows sensor permission after a user gesture.
  window.addEventListener("click", askPermission, { once: true });
  window.addEventListener("touchstart", askPermission, { once: true });
}

// Gentle auto movement so logo keeps life even without input.
setInterval(() => {
  if (Date.now() - lastInputAt > 1600) {
    targetX = Math.sin(Date.now() / 850) * 0.18;
    targetY = Math.cos(Date.now() / 1100) * 0.14;
  }
}, 120);

// Lazy-load iframes using IntersectionObserver
function setupIframeObserver() {
  const iframes = document.querySelectorAll(".qrz-iframe[data-src]");
  if (!iframes.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          const src = iframe.getAttribute("data-src");
          if (src && !iframe.src) {
            iframe.src = src;
            iframe.removeAttribute("data-src");
            observer.unobserve(iframe);
          }
        }
      });
    },
    { rootMargin: "50px" }
  );

  iframes.forEach((iframe) => observer.observe(iframe));
}

setupIframeObserver();

setupMobileMotion();
applyTransform();

// Cleanup on page visibility change
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (rafId) cancelAnimationFrame(rafId);
  } else {
    applyTransform();
  }
});