import * as React from 'react';
import { Popover, Card, Avatar } from 'antd';
import TypesIcon from '../Types/TypesIcon';
import { File } from '@bbp/nexus-sdk';

import './Resources.less';

export interface ImagePreviewProps {
  file: File;
}

const ImagePreview: React.FunctionComponent<ImagePreviewProps> = props => {
  const { mediaType, self } = props;

  // const Preview =
  //   raw._mediaType && raw._mediaType.includes('image') ? (
  //     <Avatar src={self} />
  //   ) : null;

  return <Avatar />;
};

export default ImagePreview;
