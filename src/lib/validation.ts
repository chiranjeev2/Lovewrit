export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_AUDIO_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/jpg",
];

export const ALLOWED_AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: { size: number; type: string; name: string }): ValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: "Image file exceeds 10MB limit. Please upload a smaller photo." };
  }

  const normalizedType = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const allowedExtensions = ["jpg", "jpeg", "png", "webp", "heic"];

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(normalizedType) && !allowedExtensions.includes(ext)) {
    return { valid: false, error: "Invalid image format. Allowed: JPG, PNG, WEBP, HEIC." };
  }

  return { valid: true };
}

export function validateAudioFile(file: { size: number; type: string; name: string }): ValidationResult {
  if (!file) {
    return { valid: false, error: "No audio file provided" };
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return { valid: false, error: "Audio file exceeds 15MB limit. Please upload a track under 15MB." };
  }

  const normalizedType = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const allowedExtensions = ["mp3", "wav", "ogg", "m4a", "aac"];

  if (!ALLOWED_AUDIO_MIME_TYPES.includes(normalizedType) && !allowedExtensions.includes(ext)) {
    return { valid: false, error: "Invalid audio format. Allowed: MP3, WAV, OGG, M4A." };
  }

  return { valid: true };
}
