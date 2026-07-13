// Membros do time. Para editar a galeria, mexa apenas neste array.
// Foto: coloque um arquivo ./members/<indicativo-minusculo>.jpg (ex: members/pp5kj.jpg);
// sem foto, o card mostra as iniciais do nome. "callsigns" vazio = card sem link QRZ.
const TEAM_MEMBERS = [
  { name: "Gibson", callsigns: ["PP5GW"] },
  { name: "Ricardo Pires", callsigns: ["PP5BM"] },
  { name: "Daniel (DAN)", callsigns: ["PP5DAN"] },
  { name: "Daniel Régis", callsigns: ["PP5RD"] },
  { name: "Hélio Vidal", callsigns: ["PU5HVW"] },
  { name: "Henrique", callsigns: ["PP5NY"] },
  { name: "João Carlos (Cabreuva)", callsigns: ["PP5GTA", "PY2GTA"] },
  { name: "Rodrigo", callsigns: ["PP5NB"] },
  { name: "Ronaldo", callsigns: [] },
  { name: "Evandro", callsigns: ["PU5LAF"] },
  { name: "Roberto Franz", callsigns: ["PU5LPZ"] },
  { name: "Vinicius Macedo", callsigns: ["PP5KJ"] },
];

const scene = document.getElementById("logoScene");
const logo = document.getElementById("logo");
const deployMeta = document.getElementById("deployMeta");
const easterEggToast = document.getElementById("easterEggToast");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let lastInputAt = 0;
let sensorInputAt = 0;
let rafId = null;
let keyBuffer = "";
let eggTimerId = null;

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

function setupEasterEgg() {
  if (!easterEggToast) {
    return;
  }

  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    const key = (event.key || "").toUpperCase();
    if (!/^[A-Z0-9]$/.test(key)) {
      return;
    }

    keyBuffer = (keyBuffer + key).slice(-8);
    if (keyBuffer.includes("CQDX")) {
      easterEggToast.classList.remove("is-visible");
      void easterEggToast.offsetWidth;
      easterEggToast.classList.add("is-visible");

      if (eggTimerId) {
        clearTimeout(eggTimerId);
      }

      eggTimerId = setTimeout(() => {
        easterEggToast.classList.remove("is-visible");
      }, 6000);

      keyBuffer = "";
    }
  });
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

function memberInitials(name) {
  const words = name.replace(/\(.*?\)/g, "").trim().split(/\s+/);
  const first = words[0] ? words[0][0] : "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function memberPhotoSlug(member) {
  const base = member.callsigns[0] || member.name.split(/\s+/)[0];
  return base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]/g, "");
}

function renderTeamMembers() {
  const grid = document.getElementById("membersGrid");
  if (!grid) {
    return;
  }

  TEAM_MEMBERS.forEach((member) => {
    const card = document.createElement("article");
    card.className = "member-card";

    const avatar = document.createElement("div");
    avatar.className = "member-avatar";

    const initials = document.createElement("span");
    initials.className = "member-initials";
    initials.setAttribute("aria-hidden", "true");
    initials.textContent = memberInitials(member.name);
    avatar.appendChild(initials);

    const photo = document.createElement("img");
    photo.className = "member-photo";
    photo.alt = `Foto de ${member.name}`;
    photo.loading = "lazy";
    const slug = memberPhotoSlug(member);
    const photoSources = [`./members/${slug}.jpg`, `./members/${slug}.png`];
    let photoSourceIndex = 0;
    photo.addEventListener("error", () => {
      photoSourceIndex += 1;
      if (photoSourceIndex < photoSources.length) {
        photo.src = photoSources[photoSourceIndex];
      } else {
        photo.remove();
      }
    });
    photo.src = photoSources[photoSourceIndex];
    avatar.appendChild(photo);

    const name = document.createElement("p");
    name.className = "member-name";
    name.textContent = member.name;

    const callsign = document.createElement("p");
    callsign.className = "member-callsign";
    if (member.callsigns.length) {
      member.callsigns.forEach((sign, index) => {
        if (index > 0) {
          callsign.appendChild(document.createTextNode(" / "));
        }
        const link = document.createElement("a");
        link.href = `https://www.qrz.com/db/${sign}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `Perfil de ${member.name} (${sign}) no QRZ.com`);
        link.textContent = sign;
        callsign.appendChild(link);
      });
    } else {
      callsign.setAttribute("data-i18n", "team.qrzSoon");
      callsign.textContent =
        typeof GG52_I18N !== "undefined" ? GG52_I18N.t("team.qrzSoon") : "QRZ em breve";
      callsign.classList.add("member-callsign-pending");
    }

    card.appendChild(avatar);
    card.appendChild(name);
    card.appendChild(callsign);
    grid.appendChild(card);
  });
}

async function loadDeployInfo() {
  if (!deployMeta) {
    return;
  }

  try {
    const response = await fetch(`./deploy-info.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("deploy-info indisponivel");
    }

    const info = await response.json();
    const version = info.version || "desconhecida";
    const deployedAt = info.deployedAt || "nao informado";
    deployMeta.textContent = `Versao: ${version} | Ultimo deploy: ${deployedAt}`;
  } catch (_error) {
    deployMeta.textContent = "Versao: local | Ultimo deploy: ambiente de desenvolvimento";
  }
}

renderTeamMembers();
setupIframeObserver();
loadDeployInfo();
setupEasterEgg();

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