import Tesseract from 'tesseract.js';
import * as faceapi from '@vladmandic/face-api';

/**
 * Loads face-api.js models from CDN or local public folder
 */
async function loadFaceModels() {
  if (!faceapi.nets.tinyFaceDetector.isLoaded) {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
  }
}

/**
 * Masks sensitive ID numbers (Aadhaar, PAN, Service No patterns) and faces from an image Blob/File.
 * Returns a Promise that resolves to a new Blob containing the masked image.
 * 
 * @param {File | Blob} file - The original image file
 * @returns {Promise<Blob>} - The masked image blob
 */
export async function maskDocument(file) {
  return new Promise(async (resolve, reject) => {
    try {
      const imgUrl = URL.createObjectURL(file);
      const image = new Image();
      image.src = imgUrl;

      image.onload = async () => {
        URL.revokeObjectURL(imgUrl);
        
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        // 1. Detect and Mask Faces (Face-API)
        try {
          await loadFaceModels();
          const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions());
          ctx.fillStyle = 'black';
          detections.forEach(det => {
            const { x, y, width, height } = det.box;
            // Draw a black rectangle over the face
            ctx.fillRect(x, y, width, height);
          });
        } catch (e) {
          console.error("Face detection failed:", e);
        }

        // 2. Detect and Mask Text (Tesseract OCR)
        try {
          const { data: { words } } = await Tesseract.recognize(canvas, 'eng', {
            logger: m => console.log('OCR Progress:', m.status, Math.round(m.progress * 100) + '%')
          });

          const sensitiveRegex = [
            /\\b\\d{4}\\s?\\d{4}\\s?\\d{4}\\b/g, // Aadhaar (e.g. 1234 5678 9012)
            /\\b[A-Z]{5}[0-9]{4}[A-Z]{1}\\b/g,  // PAN
            /\\b(?:JC|IC|SS|SL)\\s?-\\s?\\d{4,6}[A-Z]?\\b/ig, // Army Service No
            /\\b\\d{6}[A-Z]\\b/ig, // Air Force / Navy Service No
          ];

          ctx.fillStyle = 'black';
          words.forEach(word => {
            const text = word.text;
            let isSensitive = false;
            for (let rx of sensitiveRegex) {
              if (text.match(rx)) {
                isSensitive = true;
                break;
              }
            }
            if (isSensitive) {
              const { x0, y0, x1, y1 } = word.bbox;
              ctx.fillRect(x0 - 2, y0 - 2, (x1 - x0) + 4, (y1 - y0) + 4);
            }
          });
        } catch (e) {
          console.error("OCR detection failed:", e);
        }

        // Return the masked image as Blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, file.type || 'image/jpeg', 0.85);
      };
      
      image.onerror = (err) => reject(err);
    } catch (err) {
      reject(err);
    }
  });
}
