/**
 * Resize image giữ nguyên tỷ lệ
 * Max width = 300px
 * @param {File} file
 * @returns {Promise<string>} base64 resized
 */
export function resizeAvatar(file) {
  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = function (event) {
      const img = new Image();

      img.onload = function () {

        const MAX_WIDTH = 300;

        let newWidth = img.width;
        let newHeight = img.height;

        // Nếu ảnh lớn hơn 200px thì resize
        if (img.width > MAX_WIDTH) {
          const scale = MAX_WIDTH / img.width;
          newWidth = MAX_WIDTH;
          newHeight = img.height * scale;
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Nén JPEG để giảm dung lượng
        const base64 = canvas.toDataURL('image/jpeg', 0.8);

        resolve(base64);
      };

      img.onerror = reject;
      img.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
