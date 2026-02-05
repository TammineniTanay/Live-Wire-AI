##  Overview
This module (`ws1/`) implements the **Real-Time Speech-to-Text (STT) Bridge** for LiveWire. It enables high-fidelity audio capture from Chrome tabs and microphones, streaming raw data to a local Python backend for processing.

**Key Features:**
* **Mono Force Mode:** Automatically handles audio mixing to guarantee text output regardless of hardware stereo/mono locking or driver issues.
* **File-Based Buffering:** Uses a robust disk-write strategy to prevent "Empty Audio" errors and FFmpeg pipe crashes on Windows.
* **Resilience:** Includes auto-reconnect logic for WebSocket drops and handles hardware device changes (e.g., unplugging a mic) without crashing.
* **Evidence Pack:** Automatically generates `meeting_transcript.txt` (metrics/logs) and `final_session_output.mp3` (audio) for QA verification.

---

##  Prerequisites
* **Python 3.10+**
* **FFmpeg** (Must be installed and added to System PATH)
* **OpenAI API Key** (with Whisper model access)
* **Google Chrome** (Developer Mode enabled)

---

##  Setup Instructions

### 1. Environment Setup
Create a `.env` file in this directory (do not commit this file):
```bash
OPENAI_API_KEY=((sk-proj-your-key-here))

```

### 2. Install Dependencies

Run the following command to install required Python libraries:

```bash
pip install -r requirements.txt

```

---

##  How to Run

### Step 1: Start the Server

Run the Python backend. It handles the WebSocket connection and audio processing.

```bash
python server.py

```

*You should see:* ` SYSTEM READY: Files initialized`

### Step 2: Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer Mode** (top right toggle).
3. Click **Load Unpacked**.
4. Select this `ws1/` folder (or `LiveWire-Min` folder).

### Step 3: Start Capture

1. Open a meeting or YouTube video in Chrome.
2. Click the **LiveWire Extension** icon in the toolbar.
3. Click **"Start Capture"**.

---

##  Verification Checklist

1. **Terminal Logs:** You should see ` CONNECTION ESTABLISHED` immediately followed by ` Recording Active`.
2. **Transcript:** Open `meeting_transcript.txt` to see real-time text updates.
3. **Audio Evidence:** After stopping the session (Press `Ctrl+C` in terminal), check that `final_session_output.mp3` is playable.

---

##  Troubleshooting

**Issue: "ffmpeg is not recognized"**

* **Fix:** Install FFmpeg and add the `bin/` folder to your Windows Environment Variables. Restart your terminal.

**Issue: "Mic Vol: 0" in terminal logs**

* **Fix:** Reload the extension and ensure microphone permissions are allowed in Chrome settings.

**Issue: Audio is Silent / No Text**

* **Fix:** Ensure you are playing audio in the tab (e.g., YouTube video) *before* clicking "Start Capture".

---

##  Architecture

* **`offscreen.js`**: Handles `navigator.mediaDevices` capture, silence detection, and WebSocket streaming.
* **`server.py`**: Implementation of the "Mono Force" audio pipeline and OpenAI Whisper integration.
* **`manifest.json`**: MV3 configuration with `tabCapture` and `offscreen` permissions.

```

---

### `requirements.txt`
```text
websockets
python-dotenv
openai
numpy

```