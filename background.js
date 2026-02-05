// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === 'background' && message.type === 'START_RECORDING') {
    
    // Create/Reuse offscreen document
    (async () => {
      const existing = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [chrome.runtime.getURL('offscreen.html')]
      });

      if (existing.length === 0) {
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['USER_MEDIA'],
          justification: 'Recording meeting audio'
        });
      }

      // CRITICAL: Wait 500ms to ensure offscreen.js is listening
      setTimeout(async () => {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        
        // Get the stream ID for the ACTIVE tab
        const streamId = await chrome.tabCapture.getMediaStreamId({targetTabId: tab.id});
        
        chrome.runtime.sendMessage({ 
          type: 'INIT_AUDIO', 
          target: 'offscreen', 
          data: streamId 
        });
      }, 500);
      
    })();

    sendResponse({ success: true });
    return true; 
  }
});