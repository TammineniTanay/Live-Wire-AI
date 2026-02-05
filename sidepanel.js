chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TRANSCRIPT_UPDATE') {
    const box = document.getElementById('transcript-box');
    const entry = document.createElement('div');
    entry.className = 'entry';
    
    if (message.data.includes("🎤 [ME]")) {
      entry.style.borderLeft = "4px solid #007bff";
      entry.style.background = "#e7f3ff";
    } else {
      entry.style.borderLeft = "4px solid #28a745";
      entry.style.background = "#f0fff4";
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.innerHTML = `<span class="time">${time}</span> ${message.data}`;
    
    box.appendChild(entry);
    window.scrollTo(0, document.body.scrollHeight);
  }
});