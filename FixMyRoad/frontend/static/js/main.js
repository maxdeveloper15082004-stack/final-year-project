/* ══════════════════════════════════════════════
   FixMyRoad AI – Main JavaScript
   ══════════════════════════════════════════════ */

const API_BASE = "http://127.0.0.1:5000";

// ── DOM refs ──────────────────────────────────────────────────────────────────
const fileInput       = document.getElementById("fileInput");
const dropzone        = document.getElementById("dropzone");
const dropzoneInner   = document.getElementById("dropzoneInner");
const browseBtn       = document.getElementById("browseBtn");
const previewWrap     = document.getElementById("previewWrap");
const previewImg      = document.getElementById("previewImg");
const previewMeta     = document.getElementById("previewMeta");
const detectBtn       = document.getElementById("detectBtn");
const loaderSection   = document.getElementById("loaderSection");
const resultsSection  = document.getElementById("resultsSection");
const imageMode       = document.getElementById("imageMode");
const cameraMode      = document.getElementById("cameraMode");
const modeImageBtn    = document.getElementById("modeImage");
const modeCamBtn      = document.getElementById("modeCam");
const originalImg     = document.getElementById("originalImg");
const processedImg    = document.getElementById("processedImg");
const confTitle       = document.getElementById("confTitle");
const confDesc        = document.getElementById("confDesc");
const confScore       = document.getElementById("confScore");
const confIcon        = document.getElementById("confIcon");
const detailsGrid     = document.getElementById("detailsGrid");
const resultSubtitle  = document.getElementById("resultSubtitle");
const heroUploadBtn   = document.getElementById("heroUploadBtn");
const heroCamBtn      = document.getElementById("heroCamBtn");
const analyzeAnotherBtn = document.getElementById("analyzeAnotherBtn");
const downloadBtn     = document.getElementById("downloadBtn");
const toast           = document.getElementById("toast");
const detectSound     = document.getElementById("detectSound");

// Camera
const webcamFeed  = document.getElementById("webcamFeed");
const camCanvas   = document.getElementById("camCanvas");
const startCamBtn = document.getElementById("startCamBtn");
const stopCamBtn  = document.getElementById("stopCamBtn");
const captureCamBtn = document.getElementById("captureCamBtn");

let selectedFile = null;
let cameraStream = null;
let lastResult   = null;

// ═══════════════════════════════════════════════
//  PARTICLE CANVAS
// ═══════════════════════════════════════════════
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  const ctx    = canvas.getContext("2d");
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function rand(a, b) { return a + Math.random() * (b - a); }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = rand(0, W);
      this.y  = rand(0, H);
      this.r  = rand(0.5, 2.2);
      this.dx = rand(-0.3, 0.3);
      this.dy = rand(-0.3, 0.3);
      this.alpha = rand(0.2, 0.7);
      this.color = Math.random() > 0.5 ? "124,58,237" : "6,182,212";
    }
    update() {
      this.x += this.dx; this.y += this.dy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${0.12 * (1 - d / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();
})();

// ═══════════════════════════════════════════════
//  MODE TOGGLE
// ═══════════════════════════════════════════════
function setMode(mode) {
  if (mode === "image") {
    imageMode.classList.remove("hidden");
    cameraMode.classList.add("hidden");
    modeImageBtn.classList.add("active");
    modeCamBtn.classList.remove("active");
    stopCamera();
  } else {
    cameraMode.classList.remove("hidden");
    imageMode.classList.add("hidden");
    modeCamBtn.classList.add("active");
    modeImageBtn.classList.remove("active");
  }
  resultsSection.classList.add("hidden");
}

modeImageBtn.addEventListener("click", () => setMode("image"));
modeCamBtn.addEventListener("click",   () => setMode("camera"));
heroUploadBtn.addEventListener("click", () => {
  setMode("image");
  document.getElementById("modeSection").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => fileInput.click(), 400);
});
heroCamBtn.addEventListener("click", () => {
  setMode("camera");
  document.getElementById("modeSection").scrollIntoView({ behavior: "smooth" });
});

// ═══════════════════════════════════════════════
//  DROPZONE / FILE UPLOAD
// ═══════════════════════════════════════════════
browseBtn.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("click", e => {
  if (e.target === dropzone || e.target.closest("#dropzoneInner")) fileInput.click();
});

fileInput.addEventListener("change", e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

dropzone.addEventListener("dragover", e => {
  e.preventDefault();
  dropzone.classList.add("dragging");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));
dropzone.addEventListener("drop", e => {
  e.preventDefault();
  dropzone.classList.remove("dragging");
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    showToast("⚠️ Please select an image file.");
    return;
  }
  selectedFile = file;
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewMeta.textContent = `${file.name}  ·  ${(file.size / 1024).toFixed(1)} KB`;
  previewWrap.classList.remove("hidden");
  resultsSection.classList.add("hidden");
  previewWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ═══════════════════════════════════════════════
//  DETECT (Image Upload)
// ═══════════════════════════════════════════════
detectBtn.addEventListener("click", () => {
  if (!selectedFile) { showToast("⚠️ No image selected."); return; }
  runDetection(selectedFile);
});

async function runDetection(file) {
  // Show loader
  loaderSection.classList.remove("hidden");
  resultsSection.classList.add("hidden");
  loaderSection.scrollIntoView({ behavior: "smooth" });

  const steps = ["ls1","ls2","ls3","ls4","ls5"];
  const delays = [400, 800, 1200, 1700, 2100];
  const bar = document.getElementById("loaderBar");

  steps.forEach((id, i) => {
    setTimeout(() => {
      document.getElementById(id).classList.add("active");
      bar.style.width = `${((i + 1) / steps.length) * 100}%`;
    }, delays[i]);
  });

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
    const data = await res.json();

    // Wait at least enough time for loader to feel real
    await sleep(2400);
    loaderSection.classList.add("hidden");

    if (!res.ok || data.error) {
      showToast(`❌ ${data.error || "Detection failed."}`);
      resetLoader();
      return;
    }
    lastResult = data;
    renderResults(data);
    if (data.pothole_count > 0) playDetectSound();
  } catch (err) {
    await sleep(2400);
    loaderSection.classList.add("hidden");
    showToast("❌ Could not reach the backend. Make sure Flask is running on port 5000.");
    resetLoader();
  }
}

// ═══════════════════════════════════════════════
//  RENDER RESULTS
// ═══════════════════════════════════════════════
function renderResults(data) {
  const detected = data.pothole_count > 0;

  // Images
  originalImg.src  = `data:image/jpeg;base64,${data.original_image}`;
  processedImg.src = `data:image/jpeg;base64,${data.processed_image}`;

  // Confidence banner
  confScore.textContent = `${data.overall_confidence}%`;
  if (detected) {
    confIcon.textContent  = "⚠️";
    confTitle.textContent = `${data.pothole_count} Pothole${data.pothole_count > 1 ? "s" : ""} Detected`;
    confDesc.textContent  = `AI confidence: ${data.overall_confidence}% – Immediate repair recommended`;
    document.querySelector(".confidence-banner").style.borderColor = "rgba(239,68,68,.4)";
  } else {
    confIcon.textContent  = "✅";
    confTitle.textContent = "Road Appears Clear";
    confDesc.textContent  = `No significant potholes found. Confidence: ${data.overall_confidence}%`;
    document.querySelector(".confidence-banner").style.borderColor = "rgba(16,185,129,.4)";
  }

  resultSubtitle.textContent =
    detected
      ? `Detected ${data.pothole_count} pothole region${data.pothole_count > 1 ? "s" : ""} with ${data.overall_confidence}% confidence`
      : "No potholes detected in this image";

  // Detail cards
  detailsGrid.innerHTML = "";
  data.detections.forEach((d, i) => {
    const sevClass = `sev-${d.severity.toLowerCase()}`;
    const card = document.createElement("div");
    card.className = "detail-card";
    card.style.animationDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <div class="detail-id">Detection #${d.id}</div>
      <div class="detail-conf" style="color:${d.confidence > 85 ? "#ef4444" : "#f59e0b"}">${d.confidence}%</div>
      <span class="detail-severity ${sevClass}">${d.severity}</span>
      <div style="font-size:.75rem;color:var(--text3);margin-top:.4rem">
        Box: ${d.bbox[2]}×${d.bbox[1]} px
      </div>
    `;
    detailsGrid.appendChild(card);
  });

  if (data.detections.length === 0) {
    detailsGrid.innerHTML = `<p style="color:var(--text3);font-size:.85rem;grid-column:1/-1;">No individual pothole regions to display.</p>`;
  }

  resultsSection.classList.remove("hidden");
  resultsSection.scrollIntoView({ behavior: "smooth" });
  resetLoader();
}

// ═══════════════════════════════════════════════
//  WEBCAM
// ═══════════════════════════════════════════════
startCamBtn.addEventListener("click", async () => {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcamFeed.srcObject = cameraStream;
    startCamBtn.classList.add("hidden");
    stopCamBtn.classList.remove("hidden");
    captureCamBtn.disabled = false;
    showToast("📷 Camera started – click Capture & Analyze");
  } catch (e) {
    showToast("❌ Camera access denied or unavailable.");
  }
});

stopCamBtn.addEventListener("click", stopCamera);

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  webcamFeed.srcObject = null;
  startCamBtn.classList.remove("hidden");
  stopCamBtn.classList.add("hidden");
  captureCamBtn.disabled = true;
}

captureCamBtn.addEventListener("click", () => {
  if (!cameraStream) return;
  const ctx = camCanvas.getContext("2d");
  camCanvas.width  = webcamFeed.videoWidth;
  camCanvas.height = webcamFeed.videoHeight;
  ctx.drawImage(webcamFeed, 0, 0);
  camCanvas.toBlob(blob => {
    if (!blob) { showToast("❌ Capture failed."); return; }
    const file = new File([blob], "webcam_capture.jpg", { type: "image/jpeg" });
    setMode("image");
    handleFile(file);
    runDetection(file);
  }, "image/jpeg", 0.92);
});

// ═══════════════════════════════════════════════
//  ACTIONS
// ═══════════════════════════════════════════════
analyzeAnotherBtn.addEventListener("click", () => {
  resultsSection.classList.add("hidden");
  previewWrap.classList.add("hidden");
  selectedFile = null;
  fileInput.value = "";
  imageMode.scrollIntoView({ behavior: "smooth" });
});

downloadBtn.addEventListener("click", () => {
  if (!lastResult) return;
  const link = document.createElement("a");
  link.href     = `data:image/jpeg;base64,${lastResult.processed_image}`;
  link.download = "fixmyroad_detection.jpg";
  link.click();
  showToast("✅ Detection image downloaded!");
});

// ═══════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════
function showToast(msg, duration = 3500) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), duration);
}

function resetLoader() {
  ["ls1","ls2","ls3","ls4","ls5"].forEach(id => {
    document.getElementById(id).classList.remove("active");
  });
  document.getElementById("loaderBar").style.width = "0%";
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function playDetectSound() {
  try {
    // Generate a short beep via AudioContext
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
  } catch (_) {}
}

// ── Navbar scroll effect ──────────────────────────────────────────────────────
window.addEventListener("scroll", () => {
  document.getElementById("navbar").style.boxShadow =
    window.scrollY > 10 ? "0 4px 30px rgba(0,0,0,.4)" : "none";
});
