/**
 * Read an image File, auto-downscale so embedded DataURLs stay small,
 * return { dataUrl, width, height }.
 */
export async function fileToDataUrl(
  file: File,
  maxW = 600,
  maxH = 300,
  quality = 0.9,
): Promise<{ dataUrl: string; width: number; height: number }> {
  if (!file.type.startsWith('image/')) throw new Error('Please pick an image file');
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(maxW / bitmap.width, maxH / bitmap.height, 1);
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, w, h);

  // Use JPEG for photos, PNG for things with transparency (rough heuristic)
  const mime = file.type === 'image/png' || file.type === 'image/svg+xml' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mime, quality);
  return { dataUrl, width: w, height: h };
}

export function estimateDataUrlKb(dataUrl: string): number {
  // base64 is ~4/3 of actual bytes; minus the header
  const base64 = dataUrl.split(',')[1] || '';
  return Math.round((base64.length * 3) / 4 / 1024);
}
