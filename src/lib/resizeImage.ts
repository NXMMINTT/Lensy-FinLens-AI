/** Shrinks a photo in the browser (longest side ≤ maxSide, JPEG) so phone pictures upload fast and fit the 5 MB limit. */
export async function resizeImage(file: File, maxSide = 800, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("ย่อรูปไม่สำเร็จ"))), "image/jpeg", quality),
  );
}
