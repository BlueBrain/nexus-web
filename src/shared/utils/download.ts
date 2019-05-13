import { isBrowser } from '.';
import { NexusFile } from '@bbp/nexus-sdk';

export const downloadNexusFile = async (selfUrl: string) => {
  try {
    const downloadRawFile = true;
    const file = await NexusFile.getSelf(selfUrl, downloadRawFile);
    download(file.filename, file.mediaType, file.rawFile);
  } catch (error) {
    // do something
    return error;
  }
};

export const download = (filename: string, mediaType: string, data: any) => {
  if (isBrowser) {
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
  }
};
