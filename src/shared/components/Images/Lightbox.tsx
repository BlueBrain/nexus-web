import * as React from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app

export interface LightboxProps {
  src: string;
}

const LightboxComponent: React.FunctionComponent<LightboxProps> = props => {
  const { src, children } = props;

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Lightbox mainSrc={src} onCloseRequest={() => setIsOpen(false)} />
      {children && (children as any)({ isOpen, setIsOpen })}
    </>
  );
};

export default LightboxComponent;
