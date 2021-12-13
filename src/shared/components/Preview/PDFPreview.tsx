import * as React from 'react';
import { Button } from 'antd';
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';
pdfjs.GlobalWorkerOptions.workerSrc = 'public/pdf.worker.min.js';

import './PDFPreview.less';
import {
  LeftOutlined,
  LoadingOutlined,
  RightOutlined,
} from '@ant-design/icons';

const PDFViewer: React.FC<{
  url: string;
  closePreview: () => void;
}> = ({ url, closePreview }) => {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pageNumber, setPageNumber] = React.useState<number>(1);

  const previewDivRef = React.useRef<HTMLDivElement>(null);
  /* close preview when anywhere outside the preview is clicked */
  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        previewDivRef.current &&
        !previewDivRef.current.contains(event.target)
      ) {
        closePreview();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [previewDivRef]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) =>
    setNumPages(numPages);

  const previousPage = () => setPageNumber(page => page - 1);
  const nextPage = () => setPageNumber(page => page + 1);

  const pdfFile = React.useMemo(
    () => ({
      url,
      withCredentials: true,
      httpHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('nexus__token')}`,
      },
    }),
    [url]
  );

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
            file={pdfFile}
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
