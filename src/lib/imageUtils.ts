import { appLog } from '@/lib/appLog';

/**
 * Compress an image to a target max dimension and quality.
 * Returns a JPEG blob with reduced file size.
 */
export async function compressImage(
  input: Blob,
  options: {
    maxDimension?: number; // default 1920
    quality?: number; // 0-1, default 0.8
  } = {}
): Promise<Blob> {
  const { maxDimension = 1920, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(input);

    img.onload = () => {
      try {
        let { width, height } = img;
        const originalSize = input.size;

        appLog.info('[Compress] Original', { width, height, size: originalSize });

        // Calculate new dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height / width) * maxDimension);
            width = maxDimension;
          } else {
            width = Math.round((width / height) * maxDimension);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas indisponível para compressão.'));
          return;
        }

        canvas.width = width;
        canvas.height = height;

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(url);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao comprimir imagem.'));
              return;
            }

            const ratio = ((1 - blob.size / originalSize) * 100).toFixed(1);
            appLog.info('[Compress] Final', {
              width,
              height,
              size: blob.size,
              reduction: `${ratio}%`,
            });

            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível carregar a imagem para compressão.'));
    };

    img.src = url;
  });
}

/**
 * Convert any image to JPEG format.
 */
export async function convertToJpeg(input: Blob, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(input);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas indisponível no aparelho.'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        URL.revokeObjectURL(url);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao converter imagem para JPG.'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível carregar a imagem para conversão.'));
    };

    img.src = url;
  });
}

/**
 * Create a data URL from a blob for preview purposes.
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler imagem para preview.'));
    reader.readAsDataURL(blob);
  });
}
