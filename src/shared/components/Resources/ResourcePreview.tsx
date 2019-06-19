import * as React from 'react';
import { Avatar } from 'antd';
import './Resources.less';
import { Resource, NexusFile } from '@bbp/nexus-sdk';
import useNexusImage from '../hooks/useNexusImage';

export interface ResourcePreviewProps {
  resource: Resource;
}

const ResourcePreview: React.FunctionComponent<
  ResourcePreviewProps
> = props => {
  const { resource } = props;
  const { image } = useNexusImage(resource);
  console.log({ image });
  return (
    <>
      {image ? (
        <Avatar shape="square" src={image.src} />
      ) : (
        <Avatar shape="square" icon="picture" />
      )}
    </>
  );
};

export default ResourcePreview;
