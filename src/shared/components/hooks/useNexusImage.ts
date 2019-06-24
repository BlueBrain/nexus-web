import * as React from 'react';
import Nexus, { Resource, NexusFile } from '@bbp/nexus-sdk-legacy';
import useNexusFile from './useNexusFile';

// Don't download preview if file size is > than 1MB
const DEFAULT_DISPLAY_SIZE = 1e6;

const imagesExtensions = ['tiff', 'tif', 'jpeg', 'jpg', 'png', 'svg'];

export function hasDisplayableImage(resource: Resource | NexusFile): boolean {
  if (!resource.type || !resource.type.includes('File')) {
    return false;
  }
  const nexusFile = resource as NexusFile;
  const mediaType = nexusFile.raw['_mediaType'];
  const bytes = nexusFile.raw['_bytes'];
  console.log('doing stuff');
  const fileExtension: string =
    [...nexusFile.raw['_filename'].split('.')].pop() || '';

  return (
    (mediaType.includes('image') || imagesExtensions.includes(fileExtension)) &&
    bytes <= DEFAULT_DISPLAY_SIZE
  );
}

const makeImageFromFile = (file: NexusFile) => {
  const image = new Image();
  const blob = new Blob([file.rawFile as BlobPart], { type: file.mediaType });
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
