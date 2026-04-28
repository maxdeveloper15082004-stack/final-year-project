import os
import sys

# ── Make sure the backend folder is on the path ──────────────────────────────
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from pothole_detector import detect_potholes

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, "frontend", "templates")
STATIC_DIR   = os.path.join(BASE_DIR, "frontend", "static")

app = Flask(__name__,
            template_folder=TEMPLATE_DIR,
            static_folder=STATIC_DIR)
CORS(app)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "bmp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Use JPG, PNG, WEBP, or BMP."}), 400

    try:
        image_bytes = file.read()
        if len(image_bytes) > 16 * 1024 * 1024:          # 16 MB cap
            return jsonify({"error": "File too large (max 16 MB)"}), 413

        result = detect_potholes(image_bytes)
        return jsonify({
            "success": True,
            "pothole_count":        result["pothole_count"],
            "overall_confidence":   result["overall_confidence"],
            "detections":           result["detections"],
            "processed_image":      result["processed_image"],
            "original_image":       result["original_image"],
            "image_size":           result["image_size"],
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.error(f"Detection error: {e}")
        return jsonify({"error": "Internal server error during detection"}), 500


@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "FixMyRoad AI Backend"})


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*55)
    print("  [*]  FixMyRoad AI Backend  -  Starting server...")
    print("  [>]  http://127.0.0.1:5000")
    print("="*55 + "\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
