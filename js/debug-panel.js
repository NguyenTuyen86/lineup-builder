/**
 * On-Screen Debug Panel for Mobile
 */

let debugPanel = null;
let debugLogs = [];
const MAX_LOGS = 20;

export function initDebugPanel() {
  // Create debug panel
  debugPanel = document.createElement('div');
  debugPanel.id = 'debug-panel';
  debugPanel.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.9);
    color: #0f0;
    font-family: monospace;
    font-size: 10px;
    padding: 10px;
    z-index: 999999;
    border-top: 2px solid #0f0;
    display: none;
  `;
  
  document.body.appendChild(debugPanel);
  
  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '🐛 DEBUG';
  toggleBtn.style.cssText = `
    position: fixed;
    bottom: 210px;
    right: 10px;
    z-index: 999999;
    padding: 10px;
    background: #0f0;
    color: #000;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    font-size: 14px;
  `;
  
  toggleBtn.onclick = () => {
    if (debugPanel.style.display === 'none') {
      debugPanel.style.display = 'block';
      toggleBtn.textContent = '❌ CLOSE';
    } else {
      debugPanel.style.display = 'none';
      toggleBtn.textContent = '🐛 DEBUG';
    }
  };
  
  document.body.appendChild(toggleBtn);
  
  // Override console.log
  const originalLog = console.log;
  console.log = function(...args) {
    originalLog.apply(console, args);
    debugLog(args.join(' '));
  };
  
  debugLog('✅ Debug panel ready');
}

export function debugLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  
  debugLogs.push(logEntry);
  
  // Keep only last MAX_LOGS
  if (debugLogs.length > MAX_LOGS) {
    debugLogs.shift();
  }
  
  // Update panel
  if (debugPanel) {
    debugPanel.innerHTML = debugLogs
      .map(log => `<div>${log}</div>`)
      .join('');
    
    // Auto-scroll to bottom
    debugPanel.scrollTop = debugPanel.scrollHeight;
  }
}

export function clearDebugLog() {
  debugLogs = [];
  if (debugPanel) {
    debugPanel.innerHTML = '';
  }
}
