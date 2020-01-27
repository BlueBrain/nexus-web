import * as React from 'react';
import { notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource, NexusFile } from '@bbp/nexus-sdk';

import { isFile } from '../utils/nexusMaybe';
import ImagePreviewComponent from '../components/Images/Preview';
import { getOrgAndProjectFromResource } from '../utils';

// Only preview images lower than 3MB in size
const MAX_BYTES_TO_PREVIEW = 3000000;

const ImagePreviewContainer: React.FunctionComponent<{
  resource: Resource;
  maxBytes?: number;
}> = props => {
  const nexus = useNexusContext();
  const { resource, maxBytes = MAX_BYTES_TO_PREVIEW } = props;
  const { orgLabel, projectLabel } = getOrgAndProjectFromResource(resource);
  const resourceId = resource['@id'];

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

  React.useEffect(() => {
    if (
      !isFile(resource) || // not a file
      // is not a file of type image less than (default of 3MB)
      (!(resource as NexusFile)._mediaType.includes('image') &&
        (resource as NexusFile)._bytes <= maxBytes)
    ) {
      return;
    }

    setImage({
      imageSrc,
      error: null,
      busy: true,
    });

    nexus.File.get(orgLabel, projectLabel, encodeURIComponent(resourceId), {
      as: 'blob',
    })
      .then(rawData => {
        const blob = new Blob([rawData as string], {
          type: (resource as NexusFile)._mediaType,
        });
        const src = URL.createObjectURL(blob);
        return setImage({
          imageSrc: src,
          error: null,
          busy: false,
        });
      })
      .catch((error: Error) => {
        notification.error({
          message: 'Could not fetch image',
        });
        setImage({
          imageSrc,
          error,
          busy: false,
        });
      });
  }, [resource['@id']]);

  return imageSrc ? makePreviewImage(imageSrc) : null;
};

export default ImagePreviewContainer;
