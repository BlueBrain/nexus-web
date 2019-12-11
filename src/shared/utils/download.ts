export const download = (filename: string, mediaType: string, data: any) => {
  const blob = new Blob([data], { type: mediaType });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
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
