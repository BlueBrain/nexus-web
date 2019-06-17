import * as React from 'react';
import { Resource, NexusFile } from '@bbp/nexus-sdk';
import useNexusFile from './useNexusFile';

// Don't download preview if filesize is > than 1MB
const DEFAULT_DISPLAY_SIZE = 1e6;

function includesAny(s: string, listOfStrings: string[]) {
  return listOfStrings.reduce(
    (memo, compareString) => memo || s.includes(compareString),
    false
  );
}

export function hasDisplayableImage(resource: Resource): boolean {
  // Is a File
  // has mediaType Image
  // OR
  // Includes any of these image names in the filename
  return (
    (resource.type &&
      resource.type.includes('File') &&
      ((resource.data as any)['_mediaType'] &&
        (resource.data as any)['_mediaType'].includes('image'))) ||
    (includesAny((resource.data as any)['_filename'], [
      'tiff',
      'tif',
      'jpeg',
      'jpg',
      'png',
      'svg',
    ]) &&
      (resource.data as any)['_bytes'] <= DEFAULT_DISPLAY_SIZE)
  );
}

const makeImageFromFile = (file: NexusFile) => {
  const image = new Image();
  // @ts-ignore
  const blob = new Blob([file.rawFile], { type: file.mediaType });
  image.src = URL.createObjectURL(blob);
  return image;
};

const useNexusImage = (resource: Resource) => {
  const { file, hasFileInResource, loading } = useNexusFile(
    resource,
    hasDisplayableImage
  );
  return {
    loading,
    hasImage: hasFileInResource,
    image: file && makeImageFromFile(file),
  };
};

export default useNexusImage;
