export const download = (filename: string, mediaType: string, data: any) => {
  const blob = new Blob([data], { type: mediaType });
  window.navigator.msSaveBlob(blob, filename);
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
