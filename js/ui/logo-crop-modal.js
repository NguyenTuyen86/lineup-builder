/**
 * Logo Crop Modal
 * Preserves aspect ratio (different from avatar 1:1 crop)
 */

export async function showLogoCropModal(imageSrc) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.95); display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 10000; padding: 20px;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Crop Team Logo';
    title.style.cssText = 'color: #fff; margin-bottom: 20px; font-size: 20px;';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      const maxW = 800, maxH = 600;
      let w = img.width, h = img.height;
      if (w > maxW) { h = h * maxW / w; w = maxW; }
      if (h > maxH) { w = w * maxH / h; h = maxH; }
      
      canvas.width = w; canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      
      let crop = { x: w*0.1, y: h*0.1, width: w*0.8, height: h*0.8 };
      let drag = false, resize = false, handle = null, start = {};
      
      function draw() {
        ctx.drawImage(img, 0, 0, w, h);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, crop.y);
        ctx.fillRect(0, crop.y, crop.x, crop.height);
        ctx.fillRect(crop.x+crop.width, crop.y, w-crop.x-crop.width, crop.height);
        ctx.fillRect(0, crop.y+crop.height, w, h-crop.y-crop.height);
        ctx.strokeStyle = '#00ff40'; ctx.lineWidth = 2;
        ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
        ctx.fillStyle = '#00ff40';
        [[crop.x, crop.y], [crop.x+crop.width, crop.y], [crop.x, crop.y+crop.height], [crop.x+crop.width, crop.y+crop.height]]
          .forEach(([x,y]) => ctx.fillRect(x-6, y-6, 12, 12));
      }
      
      canvas.onmousedown = (e) => {
        const r = canvas.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        const corners = [[crop.x, crop.y, 'tl'], [crop.x+crop.width, crop.y, 'tr'], 
                        [crop.x, crop.y+crop.height, 'bl'], [crop.x+crop.width, crop.y+crop.height, 'br']];
        for (const [x,y,h] of corners) {
          if (Math.abs(mx-x)<12 && Math.abs(my-y)<12) { resize=true; handle=h; start={x:mx,y:my}; return; }
        }
        if (mx>=crop.x && mx<=crop.x+crop.width && my>=crop.y && my<=crop.y+crop.height) {
          drag=true; start={x:mx-crop.x, y:my-crop.y};
        }
      };
      
      canvas.onmousemove = (e) => {
        const r = canvas.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        if (drag) {
          crop.x = Math.max(0, Math.min(w-crop.width, mx-start.x));
          crop.y = Math.max(0, Math.min(h-crop.height, my-start.y));
          draw();
        } else if (resize) {
          const dx = mx-start.x, dy = my-start.y;
          if (handle==='br') { crop.width = Math.max(50, Math.min(w-crop.x, crop.width+dx)); crop.height = Math.max(50, Math.min(h-crop.y, crop.height+dy)); }
          else if (handle==='bl') { const nw = Math.max(50, crop.width-dx); if (crop.x+dx>=0) { crop.x+=dx; crop.width=nw; } crop.height = Math.max(50, Math.min(h-crop.y, crop.height+dy)); }
          else if (handle==='tr') { crop.width = Math.max(50, Math.min(w-crop.x, crop.width+dx)); const nh = Math.max(50, crop.height-dy); if (crop.y+dy>=0) { crop.y+=dy; crop.height=nh; } }
          else if (handle==='tl') { const nw = Math.max(50, crop.width-dx); if (crop.x+dx>=0) { crop.x+=dx; crop.width=nw; } const nh = Math.max(50, crop.height-dy); if (crop.y+dy>=0) { crop.y+=dy; crop.height=nh; } }
          start = {x:mx, y:my}; draw();
        }
      };
      
      canvas.onmouseup = () => { drag=false; resize=false; };
      draw();
    };
    img.src = imageSrc;
    
    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 12px; margin-top: 20px;';
    
    const cropBtn = document.createElement('button');
    cropBtn.textContent = '✓ Crop Logo';
    cropBtn.style.cssText = 'padding: 12px 24px; background: #00a651; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600;';
    cropBtn.onclick = () => {
      const c = document.createElement('canvas'), ctx = c.getContext('2d');
      c.width = crop.width; c.height = crop.height;
      ctx.drawImage(img, (crop.x/canvas.width)*img.width, (crop.y/canvas.height)*img.height, 
                    (crop.width/canvas.width)*img.width, (crop.height/canvas.height)*img.height, 0, 0, crop.width, crop.height);
      document.body.removeChild(modal);
      resolve(c.toDataURL('image/png'));
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕ Cancel';
    cancelBtn.style.cssText = 'padding: 12px 24px; background: #666; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;';
    cancelBtn.onclick = () => { document.body.removeChild(modal); resolve(null); };
    
    controls.appendChild(cropBtn); controls.appendChild(cancelBtn);
    modal.appendChild(title); modal.appendChild(canvas); modal.appendChild(controls);
    document.body.appendChild(modal);
  });
}

export async function resizeLogoPreserveRatio(base64, maxWidth = 200) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = h * maxWidth / w; w = maxWidth; }
      const c = document.createElement('canvas'), ctx = c.getContext('2d');
      c.width = w; c.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = base64;
  });
}
