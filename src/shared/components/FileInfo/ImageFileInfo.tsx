import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FileInfo from './FileInfo';
import { Image } from 'antd';

type ImagePreviewProps = {
  src?: string;
  onSave: (name: string, description: string) => void;
  text?: string;
  title?: string;
  lastUpdated?: string;
  lastUpdatedBy?: string;
  previewDisabled: boolean;
};

export default ({
  src,
  onSave,
  text,
  title,
  lastUpdated,
  lastUpdatedBy,
  previewDisabled,
}: ImagePreviewProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <>
      {isVisible &&
        ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              zIndex: 9999,
              width: '80%',
              left: 0,
              right: 0,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <FileInfo
              onSave={(title, text) => onSave(title, text)}
              text={text || ''}
              title={title || ''}
              lastUpdated={lastUpdated || ''}
              lastUpdatedBy={lastUpdatedBy || ''}
            />
          </div>,
          document.body
        )}

      <Image
        src={src}
        preview={
          !previewDisabled && {
            visible: isVisible,
            onVisibleChange: visible => {
              setIsVisible(visible);
            },
          }
        }
      />
    </>
  );
};
