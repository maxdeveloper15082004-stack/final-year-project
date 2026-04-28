# 🚀 FixMyRoad AI – Pothole Detection System

> AI-powered Smart City Solution | Computer Vision | Flask + OpenCV

---

## 📁 Project Structure

```
FixMyRoad/
├── backend/
│   ├── app.py                  # Flask server
│   ├── pothole_detector.py     # OpenCV detection pipeline
│   └── requirements.txt
└── frontend/
    ├── templates/
    │   └── index.html          # Main UI
    └── static/
        ├── css/style.css
        └── js/main.js
```

---

## ⚙️ Setup & Run

### 1 · Install Python dependencies

```bash
cd FixMyRoad/backend
pip install -r requirements.txt
```

### 2 · Start the Flask backend

```bash
python app.py
```

Server starts at → **http://127.0.0.1:5000**

### 3 · Open the app

Visit **http://127.0.0.1:5000** in your browser.

---

## 🧠 How It Works

| Step | Technique |
|------|-----------|
| 1 | **Grayscale conversion** – reduce color noise |
| 2 | **Gaussian Blur (7×7)** – smooth the image |
| 3 | **Adaptive Threshold** – highlight dark road regions |
| 4 | **Morphological Close/Open** – fill blob gaps |
| 5 | **Canny Edge Detection** – find sharp transitions |
| 6 | **Contour Detection** – locate candidate regions |
| 7 | **Shape Filtering** – discard non-pothole shapes |
| 8 | **HUD Overlay** – draw bounding boxes & labels |

---

## 🎨 Features

- ✅ Drag & Drop image upload
- ✅ Animated particle background
- ✅ Glassmorphism / dark AI theme
- ✅ Before / After comparison
- ✅ Per-pothole confidence score + severity badge
- ✅ Live webcam capture & analyze
- ✅ Sound effect on detection
- ✅ Download processed image

---

## 📦 Dependencies

```
opencv-python
flask
flask-cors
Pillow
numpy
```
