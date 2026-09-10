import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function compressImage(file: File, quality = 0.8, maxWidth = 1920): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress image to JPEG to maximize size reduction
        const outputType = 'image/jpeg';
        const outputName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const compressedFile = new File([blob], outputName, {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Sanitizes and extracts a valid Indonesian WhatsApp mobile phone number
 * Handles formats like '022 - 4241799 / 0811 2198 853', '+62 811-2198-853', '08112198853'
 */
export function getCleanWhatsAppNumber(rawPhone?: string | null): string {
  if (!rawPhone) return '628112198853'

  // If multiple numbers separated by slash, pipe, comma, etc., find the mobile one starting with 08 or 628 or 8
  const parts = rawPhone.split(/[/|,;]/)
  let candidate = parts.find((p) => {
    const digits = p.replace(/\D/g, '')
    return digits.startsWith('08') || digits.startsWith('628') || digits.startsWith('8')
  })

  if (!candidate && parts.length > 0) {
    candidate = parts[parts.length - 1]
  }

  let cleaned = (candidate || rawPhone).replace(/\D/g, '')
  if (cleaned.startsWith('08')) {
    cleaned = '628' + cleaned.slice(2)
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned
  } else if (!cleaned.startsWith('62') && cleaned.length >= 9) {
    cleaned = '62' + cleaned
  }

  if (cleaned.length < 10 || !cleaned.startsWith('628')) {
    return '628112198853'
  }

  return cleaned
}

