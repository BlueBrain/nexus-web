import * as Sentry from '@sentry/browser';

/**
 * Dictionary of important MIME Types for the Web.
 * Redacted list, adapted from - https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 */
export const MIME_TYPE_TO_EXTENSION: { [key: string]: string } = {
  'application/asc': 'asc',
  'application/gzip': 'gz',
  'application/json': 'json',
  'application/ld+json': 'jsonld',
  'application/msword': 'doc',
  'application/octet-stream': 'bin',
  'application/pdf': 'pdf',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/x-7z-compressed': '7z',
  'application/x-tar': 'tar',
  'application/xml': 'xml',
  'application/zip': 'zip',
  'audio/aac': 'aac',
  'audio/midi,': 'mid',
  'audio/mpeg': 'mp3',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'text/css': 'css',
  'text/csv': 'csv',
  'text/html': 'htm',
  'text/javascript': 'mjs',
  'text/plain': 'txt',
  'text/turtle': 'ttl',
  'video/mp4': 'mp4',
  'video/mpeg': 'mpeg',
};

/**
 * @param encodingType - Should be one of:
 *                       * undefined
 *                       * A string containing only MIME types (e.g. -> 'text/html')
 *                       * A stirng containing MIME type and character encoding, separated by semicolons (e.g. -> 'text/plain; charset=UTF-8')
 * @returns File extension best supported for the given "encodedType" as listed in MDN (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types).
 * If no extension could be derived, the function returns an empty string.
 */
export const fileExtensionFromResourceEncoding = (encodingType?: string) => {
  const mimeType = encodingType?.split(';')[0] ?? encodingType ?? '';
  const extension = MIME_TYPE_TO_EXTENSION[mimeType]
    ? `${MIME_TYPE_TO_EXTENSION[mimeType]}`
    : '';

  if (extension === '') {
    Sentry.captureMessage(
      `Could not find extension for encoding format: ${encodingType}`
    );
  }

  return extension;
};

export const getCorrectFileExtension = (
  filename: string,
  encodingFormat: string
) => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex !== -1 && lastDotIndex !== 0) {
    const extension = filename.slice(lastDotIndex + 1);
    return extension;
  } else if (encodingFormat) {
    return fileExtensionFromResourceEncoding(encodingFormat);
  }
  return '';
};
