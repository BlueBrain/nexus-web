import * as React from 'react';
import './image-preview.less';
import useNexusImage from '../hooks/useNexusImage';
import { Resource } from '@bbp/nexus-sdk';
import LightboxComponent from './Lightbox';

export interface ImagePreviewProps {
  loading: boolean;
  hasImage: boolean;
  image: HTMLImageElement | null;
}

export const ImagePreviewComponent: React.FunctionComponent<
  ImagePreviewProps
> = props => {
  const { loading, hasImage, image } = props;

  if (!hasImage) {
    return null;
  }
  if (loading) {
    return (
      <div className="image-preview">
        <div className="wrapper -loading">
          <div className="skeleton" />
        </div>
      </div>
    );
  }
  if (image) {
    return (
      <div className="image-preview">
        <LightboxComponent src={image.src}>
          {({ setIsOpen }) => {
            return (
              <div
                className="wrapper -loaded"
                style={{ backgroundImage: `url(${image.src})` }}
                onClick={(e: React.MouseEvent) => {
                  setIsOpen(true);
                  e.stopPropagation();
                }}
              >
                <img src={image.src} />
              </div>
            );
          }}
        </LightboxComponent>
      </div>
    );
  }
  return null;
};

export const ImagePreviewContainer: React.FunctionComponent<{
  resource: Resource;
}> = props => {
  const imagePreviewProps = useNexusImage(props.resource);
  return <ImagePreviewComponent {...imagePreviewProps} />;
};

export default ImagePreviewContainer;
