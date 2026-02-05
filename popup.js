// popup.js (Safe Version)
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');

// 1. Check Status
chrome.runtime.sendMessage({ type: 'GET_STATUS', target: 'background' }, (response) => {
  if (chrome.runtime.lastError) return; // Ignore if background is asleep
  if (response && response.isRecording) setRecordingState(true);
});

// 2. Start Button
startBtn.addEventListener('click', async () => {
  statusDiv.innerText = "Requesting Mic...";
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    statusDiv.innerText = "Error: Allow Mic Access!";
    return;
  }

  statusDiv.innerText = "Starting...";

  chrome.runtime.sendMessage({ type: 'START_RECORDING', target: 'background' }, (response) => {
     // SAFETY CHECK: Did the background die?
     if (chrome.runtime.lastError || !response) {
       statusDiv.innerText = "Error: Refresh Extension & Tab";
       return;
     }

     if (response.success) {
        setRecordingState(true);
     } else {
        statusDiv.innerText = "Failed: " + response.error;
     }
  });
});

// 3. Stop Button
stopBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'STOP_RECORDING', target: 'offscreen' });
  chrome.runtime.sendMessage({ type: 'STOP_ACKNOWLEDGED', target: 'background' });
  setRecordingState(false);
  statusDiv.innerText = "Status: ✅ Saved.";
});

function setRecordingState(isRecording) {
  if (isRecording) {
    statusDiv.innerText = "Status: 🔴 Recording...";
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    statusDiv.innerText = "Ready";
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}