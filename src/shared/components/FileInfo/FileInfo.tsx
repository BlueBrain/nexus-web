import {
  CalendarOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Input, Button } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import Paragraph from 'antd/lib/typography/Paragraph';
import * as moment from 'moment';
import * as React from 'react';
import { getUsername } from '../../utils';
import FriendlyTimeAgo from '../FriendlyDate';
import './FileInfo.less';

type FileInfoProps = {
  text: string;
  title: string;
  isVisible?: boolean;
  src?: string;
  contentUrl?: string;
  assetId: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  dispatch: (params: any) => void;
  onSave: (title: string, text: string) => void;
  onImageRevision: () => void;
  setIsVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  FileUpload: () => JSX.Element;
  FileUpdate: (assetId: string) => JSX.Element;
};

const FileInfo = ({
  text,
  title,
  lastUpdated,
  lastUpdatedBy,
  onSave,
  dispatch,
  onImageRevision,
  FileUpload,
  FileUpdate,
  contentUrl,
  assetId,
  src,
}: FileInfoProps) => {
  const [mode, setMode] = React.useState<
    'minified' | 'expanded' | 'edit' | 'revision'
  >('minified');
  const [editedText, setEditedText] = React.useState(text);
  const [editedTitle, setEditedTitle] = React.useState(title);
  
  return (
    <div className="file-info-wrapper">
      <section aria-label="File Information" className="file-info">
        <div className="file-metadata">
          <div style={{ minHeight: '1em', marginRight: '8px' }}>
            {mode === 'edit' && (
              <Input
                aria-label="Asset Name"
                type="text"
                value={editedTitle}
                onChange={e => setEditedTitle(e.currentTarget.value)}
              />
            )}
            {mode !== 'edit' && (
              <div
                aria-label="Asset Name"
                style={{
                  textOverflow: 'ellipsis',
                  maxWidth: '150px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                title={title || 'No title'}
              >
                {title || <em>No title</em>}
              </div>
            )}
          </div>
          <div className="last-updated" aria-label="Last Updated">
            <label className="asset-details__last-updated">
              <CalendarOutlined />
              &nbsp;
              <FriendlyTimeAgo
                date={moment(lastUpdated)}
                getPopupContainer={() =>
                  document.getElementsByClassName(
                    'file-info-wrapper'
                  )[0] as HTMLElement
                }
              />
            </label>
          </div>
          <div className="last-updated-by" aria-label="Last Updated By">
            <UserOutlined />
            &nbsp;
            {lastUpdatedBy && getUsername(lastUpdatedBy)}
          </div>
        </div>
        <div className="description-container">
          {(mode === 'minified' || mode === 'expanded') && (
            <>
              <div key={mode}>
                <Paragraph
                  aria-label="Asset Description"
                  style={{ color: '#fff' }}
                  ellipsis={
                    mode === 'minified'
                      ? {
                          symbol: 'Read more',
                          expandable: true,
                          rows: 3,
                          onExpand: () => setMode('expanded'),
                        }
                      : false
                  }
                >
                  {text}
                </Paragraph>
              </div>
              {mode === 'expanded' && (
                <Button
                  className="button-blend"
                  onClick={() => setMode('minified')}
                >
                  <span>Read less</span>
                </Button>
              )}
            </>
          )}
          {mode === 'edit' && (
            <div className={`description-text__expanded`}>
              <TextArea
                aria-label="Asset Description"
                value={editedText}
                onChange={e => setEditedText(e.currentTarget.value)}
                rows={8}
              ></TextArea>
              <div style={{ marginTop: '8px', display: 'flex' }}>
                <div style={{ marginLeft: 'auto' }}>
                  <Button
                    type="default"
                    onClick={() => {
                      setEditedText(text);
                      setEditedTitle(title);
                      setMode('minified');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ marginLeft: '4px' }}
                    type="primary"
                    onClick={() => {
                      onSave(editedTitle, editedText);
                      setMode('minified');
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <div className="file-info-menu">
        {mode !== 'edit' && (
          <>
            <Button
              aria-label="Edit name and description"
              onClick={() => setMode('edit')}
              className="button-blend"
            >
              <EditOutlined />
            </Button>
            {FileUpdate(assetId)}
          </>
        )}
      </div>
    </div>
  );
};

export default FileInfo;
