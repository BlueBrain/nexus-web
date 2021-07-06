import * as React from 'react';
import { Button } from 'antd';
import { Resource, NexusClient } from '@bbp/nexus-sdk';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import './PDFPreview.less';
import {
  LeftOutlined,
  LoadingOutlined,
  RightOutlined,
} from '@ant-design/icons';

const PDFViewer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
  url: string;
  previewDivRef: React.RefObject<HTMLDivElement>;
}> = ({ resource, nexus, previewDivRef, url }) => {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pageNumber, setPageNumber] = React.useState<number>(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) =>
    setNumPages(numPages);

  const previousPage = () => setPageNumber(page => page - 1);
  const nextPage = () => setPageNumber(page => page + 1);

  return (
    <div className="asset-preview-mask">
      <div className="asset-preview-wrap">
        <div className="asset-preview">
          <Document
            inputRef={previewDivRef}
            className="document"
            loading={
              <div className="loadingMessage">
                <LoadingOutlined />
              </div>
            }
            file={{
              url,
              withCredentials: true,
              httpHeaders: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('nexus__token')}`,
              },
            }}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page pageNumber={pageNumber} height={window.innerHeight - 150} />
            <div className="page-controls">
              <Button
                disabled={pageNumber <= 1}
                onClick={previousPage}
                icon={<LeftOutlined />}
                size="large"
              />
              <span>
                {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
              </span>
              <Button
                disabled={pageNumber >= numPages}
                onClick={nextPage}
                icon={<RightOutlined />}
                size="large"
              />
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
