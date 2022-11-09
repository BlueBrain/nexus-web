import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PDFViewer, { PDFThumbnail } from '../Preview/PDFPreview';
import FileInfo from './FileInfo';

type PDFPreviewProps = {
  src?: string;
  onSave: (name: string, description: string) => void;
  onImageRevision: () => void;
  text?: string;
  title?: string;
  lastUpdated?: string;
  lastUpdatedBy?: string;
  previewDisabled: boolean;
  contentUrl?: string;
  assetId: string;
  dispatch: (params: any) => void;
  FileUpload: (analysisReportId?: string) => JSX.Element;
  FileUpdate: (assetId: string) => JSX.Element;
};

export default ({
  src,
  onSave,
  onImageRevision,
  text,
  title,
  lastUpdated,
  lastUpdatedBy,
  previewDisabled,
  dispatch,
  FileUpload,
  FileUpdate,
  contentUrl,
  assetId,
}: PDFPreviewProps) => {
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
              dispatch={dispatch}
              FileUpload={FileUpload}
              FileUpdate={FileUpdate}
              assetId={assetId}
              contentUrl={contentUrl}
              onImageRevision={() => onImageRevision()}
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
          onPreview={() => !previewDisabled && setIsVisible(true)}
        />
      )}
      {isVisible && src && (
        <PDFViewer url={src} closePreview={() => setIsVisible(false)} />
      )}
    </>
  );
};
