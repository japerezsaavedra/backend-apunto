/**
 * Utilidades para conversión y manejo de imágenes
 */

/**
 * Convierte una imagen base64 (data URI) a Buffer
 */
export const base64ToBuffer = (base64String: string): Buffer => {
  // Remover el prefijo data:image/...;base64, si existe
  const base64Data = base64String.includes(',')
    ? base64String.split(',')[1]
    : base64String;

  return Buffer.from(base64Data, 'base64');
};

/**
 * Extrae el MIME type de un data URI
 */
export const getMimeTypeFromDataUri = (dataUri: string): string => {
  const match = dataUri.match(/data:([^;]+);base64/);
  return match ? match[1] : 'image/jpeg';
};

/**
 * Valida que una cadena sea un data URI de imagen válido
 */
export const isValidImageDataUri = (dataUri: string): boolean => {
  return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(dataUri);
};

