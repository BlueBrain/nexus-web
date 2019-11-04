import * as React from 'react';
import { notification } from 'antd';
import { useAsyncEffect } from 'use-async-effect/';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, NexusFile } from '@bbp/nexus-sdk';

import { isFile } from '../utils/nexusMaybe';
import { getResourceLabelsAndIdsFromSelf } from '../utils';
import ImagePreviewComponent from '../components/Images/Preview';

// Only preview images lower than 3MB in size
const MAX_BYTES_TO_PREVIEW = 3000000;

const ImagePreviewContainer: React.FunctionComponent<{
  resource: Resource;
  maxBytes?: number;
}> = props => {
  const nexus = useNexusContext();
  const { resource, maxBytes = MAX_BYTES_TO_PREVIEW } = props;
  const {
    orgLabel,
    projectLabel,
    resourceId,
  } = getResourceLabelsAndIdsFromSelf(resource['_self']);

  const [{ busy, imageSrc, error }, setImage] = React.useState<{
    busy: boolean;
    error: Error | null;
    imageSrc: string | null;
  }>({
    busy: false,
    imageSrc: null,
    error: null,
  });

  const makePreviewImage = (imageSrc: string) => {
    const img = new Image();
    img.src = imageSrc;
    return <ImagePreviewComponent busy={busy} image={img} />;
  };

  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return;
      }
      if (!isFile(resource)) {
        return;
      }

      try {
        setImage({
          imageSrc,
          error: null,
          busy: true,
        });
        const file = (await nexus.File.get(orgLabel, projectLabel, resourceId, {
          as: 'json',
        })) as NexusFile;

        if (file._mediaType.includes('image') && file._bytes <= maxBytes) {
          const rawData = (await nexus.File.get(
            orgLabel,
            projectLabel,
            resourceId,
            { as: 'blob' }
          )) as Blob;
          const blob = new Blob([rawData], { type: file._mediaType });
          const src = URL.createObjectURL(blob);
          return setImage({
            imageSrc: src,
            error: null,
            busy: false,
          });
        }
        setImage({
          imageSrc,
          error: null,
          busy: false,
        });
      } catch (error) {
        notification.error({
          message: 'Could not fetch image',
        });
        setImage({
          imageSrc,
          error,
          busy: false,
        });
      }
    },
    [resource['@id']]
  );

  return imageSrc ? makePreviewImage(imageSrc) : null;
};

export default ImagePreviewContainer;
