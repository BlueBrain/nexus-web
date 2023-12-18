import { fileExtensionFromResourceEncoding } from '../../utils/contentTypes';

export const download = (
  filename: string,
  mediaType: string | undefined,
  data: any
) => {
  const blob = new Blob([data], { type: mediaType });
  const extension = fileExtensionFromResourceEncoding(mediaType);

  // Check if filename already ends with the correct extension
  const hasCorrectExtension = filename.endsWith(`.${extension}`);

  if ((window.navigator as any).msSaveBlob) {
    (window.navigator as any).msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    // Only append extension if it's not already present or no mediaType is passed
    link.download =
      hasCorrectExtension || !mediaType ? filename : `${filename}.${extension}`;
    link.click();
  }
};

export const downloadCanvasAsImage = (
  filename: string,
  canvas: HTMLCanvasElement
) => {
  const link = document.createElement('a');
  link.download = filename;
  const img = canvas.toDataURL('image/png');
  link.href = img;
  link.click();
  link.remove();
};
