import * as React from 'react';
import { Resource, NexusFile } from '@bbp/nexus-sdk';
import useNexusFile from './useNexusFile';

// Don't download preview if filesize is > than 1MB
const DEFAULT_DISPLAY_SIZE = 1e6;

export function hasDisplayableImage(resource: Resource): boolean {
  return (
    resource.type &&
    resource.type.includes('File') &&
    (resource.data as any)['_mediaType'] &&
    (resource.data as any)['_mediaType'].includes('image') &&
    (resource.data as any)['_bytes'] <= DEFAULT_DISPLAY_SIZE
  );
}

const makeImageFromFile = (file: NexusFile) => {
  const image = new Image();
  image.src = `data:${file.mediaType};base64,${file.rawFile as string}`;
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
