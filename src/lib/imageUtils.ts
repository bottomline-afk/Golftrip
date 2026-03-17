/**
 * Resize and center-crop an image file to a square of targetSize.
 * Uses createImageBitmap when available for better memory handling on
 * mobile devices (especially iOS Safari with large camera photos).
 */
export async function resizeAndCropImage(
  file: File,
  targetSize: number,
  format: 'image/jpeg' | 'image/webp' = 'image/jpeg',
  quality = 0.85
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  // Center-crop to square
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas context unavailable');
  }

  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, targetSize, targetSize);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        // If the requested format isn't supported (e.g. WebP on older iOS),
        // fall back to JPEG.
        if (format !== 'image/jpeg') {
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) resolve(jpegBlob);
              else reject(new Error('Canvas toBlob failed'));
            },
            'image/jpeg',
            quality
          );
        } else {
          reject(new Error('Canvas toBlob failed'));
        }
      },
      format,
      quality
    );
  });
}
