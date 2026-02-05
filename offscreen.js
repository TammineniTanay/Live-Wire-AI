// offscreen.js (Simplified)
let socket;
let mediaRecorder;

async function startCapture(streamId) {
  console.log("🔗 Connecting...");
  socket = new WebSocket('ws://127.0.0.1:5000');
  
  socket.onopen = async () => {
    console.log("✅ Connected!");

    // 1. Get Streams
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const tabStream = await navigator.mediaDevices.getUserMedia({
      audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } }
    });

    // 2. Play Tab Audio (Required)
    const monitor = new Audio();
    monitor.srcObject = tabStream;
    monitor.play();

    // 3. Simple Mix (No complex Left/Right split)
    const audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();
    
    const micSource = audioContext.createMediaStreamSource(micStream);
    const tabSource = audioContext.createMediaStreamSource(tabStream);
    
    micSource.connect(dest);
    tabSource.connect(dest);

    // 4. Record
    mediaRecorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus' });
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0 && socket.readyState === 1) socket.send(e.data);
    };
    mediaRecorder.start(1000); 
  };
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.target === 'offscreen' && msg.type === 'INIT_AUDIO') startCapture(msg.data);
});