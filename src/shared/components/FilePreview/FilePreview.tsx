import {
  CalendarOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Input } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import * as moment from 'moment';
import * as React from 'react';
import { getUsername } from '../../../shared/utils';
import FriendlyTimeAgo from '../FriendlyDate';
import './FilePreview.less';

type FilePreviewProps = {
  text: string;
  title: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  onSave: (title: string, text: string) => void;
};

const FilePreview = ({
  text,
  title,
  lastUpdated,
  lastUpdatedBy,
  onSave,
}: FilePreviewProps) => {
  const [mode, setMode] = React.useState<'minified' | 'expanded' | 'edit'>(
    'minified'
  );
  const [editedText, setEditedText] = React.useState(text);
  const [editedTitle, setEditedTitle] = React.useState(title);

  return (
    <div className="file-preview-wrapper">
      <div className="file-preview">
        <div className="file-metadata">
          <div aria-label="Name" style={{ minHeight: '1em' }}>
            {mode === 'edit' && (
              <Input
                type="text"
                value={editedTitle}
                onChange={e => setEditedTitle(e.currentTarget.value)}
              />
            )}
            {mode !== 'edit' && (title || <em>No title</em>)}
          </div>
          <div className="last-updated" aria-label="Last Updated">
            <label
              className="asset-details__last-updated"
              aria-label="Last Updated"
            >
              <CalendarOutlined />
              &nbsp;
              <FriendlyTimeAgo
                date={moment(lastUpdated)}
                getPopupContainer={() =>
                  document.getElementsByClassName(
                    'file-preview-wrapper'
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
              <div
                aria-label="Description"
                className={`description-text__${
                  mode === 'minified' ? 'minified' : 'expanded'
                }`}
              >
                {text}
              </div>
              <Button
                className="button-blend"
                onClick={() =>
                  setMode(mode === 'expanded' ? 'minified' : 'expanded')
                }
              >
                <span>Read {mode === 'minified' ? 'more' : 'less'}</span>
              </Button>
            </>
          )}
          {mode === 'edit' && (
            <div className={`description-text__expanded`}>
              <TextArea
                value={editedText}
                onChange={e => setEditedText(e.currentTarget.value)}
              ></TextArea>
              <Button
                type="default"
                onClick={() => {
                  setEditedText(text);
                  setEditedTitle(title);
                  setMode('expanded');
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  onSave(editedTitle, editedText);
                  setMode('expanded');
                }}
              >
                Save
              </Button>
            </div>
          )}
        </div>
        <div className="file-preview-menu">
          {mode !== 'edit' && (
            <Button onClick={() => setMode('edit')}>
              <EditOutlined />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
