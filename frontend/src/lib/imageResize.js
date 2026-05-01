// Read a File into an HTMLImageElement, drawing through canvas to produce a
// resized JPEG data URL. Used for avatar uploads — keeps payloads ~30-50 KB.

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export async function resizeImageToDataUrl(file, maxSize = 256, quality = 0.85) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Selected file is not an image');
  }
  const img = await loadImage(file);
  const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  // White backdrop in case of transparent PNG → JPEG flattening.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}
