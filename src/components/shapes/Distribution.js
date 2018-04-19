import React from 'react';
import FontAwesome from 'react-fontawesome';
import prettyBytes from 'pretty-bytes';
import ReactTooltip from 'react-tooltip';
import { getToken } from '../../auth';
import { downloadAttachment } from '@bbp/nexus-js-helpers';

const Distribution = distribution => {
  if (!distribution) { return }
  const { downloadURL, contentSize, originalFileName, mediaType } = Array.isArray(distribution) ? distribution[0] : distribution;
  const [, fileType] = originalFileName.split('.')
  return (
    <div className="property distribution bordered-box">
      <div className="handle"></div>
      <div className="container">
        <ReactTooltip
          id={originalFileName}
          className='small-tooltip'
          effect='solid'
        />
        <div className="category-icon" data-for={originalFileName} data-tip="attachment">
          <FontAwesome name="paperclip" />
        </div>
        <div className="key ellipsis">{originalFileName}</div>
        {Preview(mediaType, downloadURL)}
        <div className="media-box">
          <div className="download">
            <a onClick={fetchAttachment(downloadURL, originalFileName)} download>
              <FontAwesome name="download" />  download
            </a>
          </div>
          <div>
            <small><b>Size</b> {prettyBytes(contentSize.value)}</small><br />
            <small><b>Media Type</b> {fileType}</small><br />
          </div>
        </div>
      </div>
    </div>
  );
}

const Preview = (mediaType, downloadURL) => {
  const mimeType = mediaType.split(';')[0];
  if ((mimeType !== 'image/jpeg') && (mimeType !== 'image/png')) {
    return;
  }
  return (
    <div className="media-preview" style={{ backgroundImage: `url(${downloadURL})` }}>
    </div>
  );
}
/**
 * Download an attachment, including if restricted by ACLs
 *
 * We use the fetch API since for non-public attachments
 * we have to add the HTTP Authorization header to the request.
 *
 * @param {string} uri
 * @param {string} fileName
 */
function fetchAttachment(uri, fileName) {
  return () => {
    const access_token = getToken();
    downloadAttachment(uri, fileName, access_token);
  };
}

export default Distribution;
