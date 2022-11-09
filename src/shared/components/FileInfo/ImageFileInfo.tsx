import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FileInfo from './FileInfo';
import { Image } from 'antd';

type ImagePreviewProps = {
  src?: string;
  onSave: (name: string, description: string) => void;
  onImageRevision?: () => void;
  text?: string;
  title?: string;
  lastUpdated?: string;
  lastUpdatedBy?: string;
  previewDisabled: boolean;
  contentUrl?: string;
  assetId: string;
  dispatch: (params: any) => void;
  FileUpload: (img?: string) => JSX.Element;
  FileUpdate: (assetId: string, img?: string) => JSX.Element;
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
}: ImagePreviewProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isRevision, setIsRevision] = React.useState(false);

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
              src={src}
              contentUrl={contentUrl}
              assetId={assetId}
              onImageRevision={() => {
                setIsRevision(true);
              }}
              onSave={(title, text) => onSave(title, text)}
              text={text || ''}
              title={title || ''}
              isVisible={isVisible}
              setIsVisible={setIsVisible}
              lastUpdated={lastUpdated || ''}
              lastUpdatedBy={lastUpdatedBy || ''}
            />
          </div>,
          document.body
        )}
      {!isRevision && (
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
      )}
    </>
  );
};
