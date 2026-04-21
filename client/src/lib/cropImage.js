/**
 * Canvas helpers for react-easy-crop (rotation + flip + pixel crop).
 */

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    if (typeof url === 'string' && !url.startsWith('blob:')) {
      image.crossOrigin = 'anonymous';
    }
    image.src = url;
  });
}

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * @param {string} imageSrc Object URL or remote URL
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop From onCropComplete
 * @param {number} rotation Degrees
 * @param {{ horizontal?: boolean, vertical?: boolean }} flip
 * @returns {Promise<Blob>}
 */
export async function getCroppedImageBlob(imageSrc, pixelCrop, rotation = 0, flip = {}) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) throw new Error('Could not get cropped canvas context');

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;
  croppedCtx.clearRect(0, 0, pixelCrop.width, pixelCrop.height);

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Empty image'));
        else resolve(blob);
      },
      'image/png'
    );
  });
}
