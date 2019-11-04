import * as React from 'react';

import LightboxComponent from './Lightbox';

import './image-preview.less';

const ImagePreviewComponent: React.FunctionComponent<{
  busy: boolean;
  image: HTMLImageElement | null;
}> = props => {
  const { busy, image } = props;

  if (busy) {
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

export default ImagePreviewComponent;
