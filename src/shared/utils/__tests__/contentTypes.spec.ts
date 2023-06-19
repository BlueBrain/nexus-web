import {
  fileExtensionFromResourceEncoding,
  getCorrectFileExtension,
} from '../../../utils/contentTypes';

describe('fileExtensionFromResourceEncoding', () => {
  it('should return the file extension for a valid encoding type', () => {
    const encodingType = 'image/jpeg';
    const extension = fileExtensionFromResourceEncoding(encodingType);
    expect(extension).toBe('jpeg');
  });

  it('should return an empty string for an unknown encoding type', () => {
    const encodingType = 'unknown/type';
    const extension = fileExtensionFromResourceEncoding(encodingType);
    expect(extension).toBe('');
  });

  it('should handle encoding types with additional parameters', () => {
    const encodingType = 'audio/aac; bitrate=320kbps';
    const extension = fileExtensionFromResourceEncoding(encodingType);
    expect(extension).toBe('aac');
  });
});
describe('getCorrectFileExtension', () => {
  it('should return the file name extension if the file has extension', () => {
    const item = {
      filename: 'first-image.png',
      encodingFormat: 'image/jpeg',
    };
    const extension = getCorrectFileExtension(
      item.filename,
      item.encodingFormat
    );
    expect(extension).toBe('png');
  });

  it('should return the file encoding format if the file do not has extension', () => {
    const item = {
      filename: 'first-image',
      encodingFormat: 'image/jpeg',
    };
    const extension = getCorrectFileExtension(
      item.filename,
      item.encodingFormat
    );
    expect(extension).toBe('jpeg');
  });
});
