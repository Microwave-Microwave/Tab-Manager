// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log('Tab Group Manager extension installed');
});

// Optional: Add context menu items or keyboard shortcuts here in the future
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Handle messages from popup if needed
    if (request.action === 'performBackgroundTask') {
        // Handle any background tasks here
        sendResponse({ success: true });
    }
});