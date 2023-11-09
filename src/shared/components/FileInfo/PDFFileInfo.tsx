import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PDFViewer, { PDFThumbnail } from '../Preview/PDFPreview';
import FileInfo from './FileInfo';

type PDFPreviewProps = {
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
}: PDFPreviewProps) => {
  console.log('PDF File Info - previewDisabled', previewDisabled)
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
      {src && (
        <PDFThumbnail
          previewDisabled={previewDisabled}
          url={src}
          onPreview={() => {
            console.log('PDF Thumbnail Clicked', previewDisabled, isVisible)
            !previewDisabled && setIsVisible(true)
          }}
        />
      )}
      {isVisible && src && (
        <PDFViewer url={src} closePreview={() => setIsVisible(false)} />
      )}
    </>
  );
};
