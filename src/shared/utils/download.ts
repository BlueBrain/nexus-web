import { fileExtensionFromResourceEncoding } from '../../utils/contentTypes';

export const download = (filename: string, mediaType: string, data: any) => {
  const blob = new Blob([data], { type: mediaType });
  const extention = fileExtensionFromResourceEncoding(mediaType);
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = extention ? `${filename}.${extention}` : filename;
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
