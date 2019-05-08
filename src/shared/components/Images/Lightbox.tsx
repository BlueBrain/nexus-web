import * as React from 'react';
import Lightbox from 'react-image-lightbox';
import '../../../../node_modules/react-image-lightbox/style.css';

export interface LightboxProps {
  src: string;
  children: ({
    isOpen,
    setIsOpen,
  }: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }) => React.ReactNode;
}

const LightboxComponent: React.FunctionComponent<LightboxProps> = props => {
  const { src, children } = props;

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {isOpen && (
        <Lightbox mainSrc={src} onCloseRequest={() => setIsOpen(false)} />
      )}
      {children && (children as any)({ isOpen, setIsOpen })}
    </>
  );
};

export default LightboxComponent;
