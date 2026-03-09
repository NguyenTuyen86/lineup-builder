/**
 * Avatar Crop Modal
 * 
 * Shows modal with circular crop preview
 * Supports zoom (100-500%) and drag to position
 */

/**
 * Show avatar crop modal
 * @param {string} imageBase64 - Base64 image data
 * @returns {Promise<string>} Cropped image base64 or null if cancelled
 */
export function showAvatarCropModal(imageBase64) {
  return new Promise((resolve) => {
    // Create modal
    const modal = createModal();
    document.body.appendChild(modal);
    
    // Load image
    const img = new Image();
    img.onload = () => {
      setupCropUI(modal, img, resolve);
    };
    img.src = imageBase64;
  });
}

/**
 * Create modal HTML structure
 */
function createModal() {
  const modal = document.createElement('div');
  modal.className = 'avatar-crop-modal';
  modal.innerHTML = `
    <div class="avatar-crop-overlay"></div>
    <div class="avatar-crop-container">
      <div class="avatar-crop-header">
        <h3>🖼️ Crop Avatar</h3>
        <button class="avatar-crop-close">✕</button>
      </div>
      
      <div class="avatar-crop-body">
        <div class="avatar-crop-preview">
          <canvas class="avatar-crop-canvas"></canvas>
          <div class="avatar-crop-mask"></div>
          <div class="avatar-crop-crosshair"></div>
        </div>
        
        <div class="avatar-crop-controls">
          <label>🔍 Zoom: <span class="zoom-value">100%</span></label>
          <div class="zoom-control">
            <button class="zoom-btn" data-action="out">−</button>
            <input type="range" class="zoom-slider" min="10" max="400" value="100" step="5">
            <button class="zoom-btn" data-action="in">+</button>
          </div>
          <div class="zoom-hint">💡 Drag to pan • Scroll at cursor to zoom • Slider zooms at center</div>
        </div>
      </div>
      
      <div class="avatar-crop-footer">
        <button class="avatar-crop-cancel">Cancel</button>
        <button class="avatar-crop-apply">✓ Apply</button>
      </div>
    </div>
  `;
  
  return modal;
}

/**
 * Setup crop UI with drag & zoom
 */
function setupCropUI(modal, img, resolve) {
  const canvas = modal.querySelector('.avatar-crop-canvas');
  const ctx = canvas.getContext('2d');
  const slider = modal.querySelector('.zoom-slider');
  const zoomValue = modal.querySelector('.zoom-value');
  const zoomInBtn = modal.querySelector('[data-action="in"]');
  const zoomOutBtn = modal.querySelector('[data-action="out"]');
  const applyBtn = modal.querySelector('.avatar-crop-apply');
  const cancelBtn = modal.querySelector('.avatar-crop-cancel');
  const closeBtn = modal.querySelector('.avatar-crop-close');
  
  // Canvas size = preview size
  const PREVIEW_SIZE = 300;  // ✅ 300px
  canvas.width = PREVIEW_SIZE;
  canvas.height = PREVIEW_SIZE;
  
  // Image state
  let scale = 1.0;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  
  // Initial centering
  centerImage();
  render();
  
  // Zoom slider - zoom at center
  slider.addEventListener('input', (e) => {
    const centerX = PREVIEW_SIZE / 2;
    const centerY = PREVIEW_SIZE / 2;
    
    // Calculate center position in image space before zoom
    const beforeScale = scale;
    const imageX = centerX - offsetX;
    const imageY = centerY - offsetY;
    
    // Update zoom
    scale = parseInt(e.target.value) / 100;
    zoomValue.textContent = `${e.target.value}%`;
    
    // Adjust offset to keep center fixed
    const scaleRatio = scale / beforeScale;
    offsetX = centerX - imageX * scaleRatio;
    offsetY = centerY - imageY * scaleRatio;
    
    render();
  });
  
  // Zoom buttons - zoom at center
  zoomInBtn.addEventListener('click', () => {
    const centerX = PREVIEW_SIZE / 2;
    const centerY = PREVIEW_SIZE / 2;
    const beforeScale = scale;
    const imageX = centerX - offsetX;
    const imageY = centerY - offsetY;
    
    const newValue = Math.min(400, parseInt(slider.value) + 50);
    slider.value = newValue;
    scale = newValue / 100;
    zoomValue.textContent = `${newValue}%`;
    
    const scaleRatio = scale / beforeScale;
    offsetX = centerX - imageX * scaleRatio;
    offsetY = centerY - imageY * scaleRatio;
    
    render();
  });
  
  zoomOutBtn.addEventListener('click', () => {
    const centerX = PREVIEW_SIZE / 2;
    const centerY = PREVIEW_SIZE / 2;
    const beforeScale = scale;
    const imageX = centerX - offsetX;
    const imageY = centerY - offsetY;
    
    const newValue = Math.max(10, parseInt(slider.value) - 50);  // ✅ Min 10%
    slider.value = newValue;
    scale = newValue / 100;
    zoomValue.textContent = `${newValue}%`;
    
    const scaleRatio = scale / beforeScale;
    offsetX = centerX - imageX * scaleRatio;
    offsetY = centerY - imageY * scaleRatio;
    
    render();
  });
  
  // Mouse wheel zoom - ZOOM AT MOUSE POSITION
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate mouse position in image space before zoom
    const beforeScale = scale;
    const imageX = mouseX - offsetX;
    const imageY = mouseY - offsetY;
    
    // Update zoom
    const delta = e.deltaY > 0 ? -10 : 10;
    const newValue = Math.max(10, Math.min(400, parseInt(slider.value) + delta));  // ✅ 10-400%
    slider.value = newValue;
    scale = newValue / 100;
    zoomValue.textContent = `${newValue}%`;
    
    // Adjust offset to keep mouse position fixed
    const scaleRatio = scale / beforeScale;
    offsetX = mouseX - imageX * scaleRatio;
    offsetY = mouseY - imageY * scaleRatio;
    
    render();
  });
  
  // Drag to pan
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX - offsetX;
    dragStartY = e.clientY - offsetY;
    canvas.style.cursor = 'grabbing';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    offsetX = e.clientX - dragStartX;
    offsetY = e.clientY - dragStartY;
    render();
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'grab';
    }
  });
  
  // Apply
  applyBtn.addEventListener('click', () => {
    const croppedImage = cropToCircle();
    closeModal(modal);
    resolve(croppedImage);
  });
  
  // Cancel
  const handleCancel = () => {
    closeModal(modal);
    resolve(null);
  };
  
  cancelBtn.addEventListener('click', handleCancel);
  closeBtn.addEventListener('click', handleCancel);
  
  // Close on overlay click
  modal.querySelector('.avatar-crop-overlay').addEventListener('click', handleCancel);
  
  // Render image on canvas
  function render() {
    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    ctx.drawImage(
      img,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    );
  }
  
  // Center image initially
  function centerImage() {
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    offsetX = (PREVIEW_SIZE - scaledWidth) / 2;
    offsetY = (PREVIEW_SIZE - scaledHeight) / 2;
  }
  
  // Crop to circle
  function cropToCircle() {
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    
    cropCanvas.width = PREVIEW_SIZE;
    cropCanvas.height = PREVIEW_SIZE;
    
    // Create circular clip
    cropCtx.beginPath();
    cropCtx.arc(PREVIEW_SIZE / 2, PREVIEW_SIZE / 2, PREVIEW_SIZE / 2, 0, Math.PI * 2);
    cropCtx.closePath();
    cropCtx.clip();
    
    // Draw image
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    cropCtx.drawImage(
      img,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    );
    
    return cropCanvas.toDataURL('image/png');
  }
}

/**
 * Close and remove modal
 */
function closeModal(modal) {
  modal.classList.add('closing');
  setTimeout(() => {
    modal.remove();
  }, 200);
}