import * as React from 'react';
import { Alert, Button } from 'antd';
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';
pdfjs.GlobalWorkerOptions.workerSrc = 'public/pdf.worker.min.js';

import './PDFPreview.less';
import {
  LeftOutlined,
  LoadingOutlined,
  RightOutlined,
} from '@ant-design/icons';
import useMeasure from '../../hooks/useMeasure';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

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
        !previewDivRef.current.contains(event.target) &&
        !event.target.closest('.page-controls')
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
  const [{ ref: wrapperHeightRef }, bounds] = useMeasure();
  const [pdfDimensions, setPdfDimensions] = React.useState<{
    height: number;
    width: number;
  }>();

  /**
   * Returns either height or width prop for specifying
   * size of PDF document for display on screen depending
   * on which axis is the limiting one.
   */
  const calculatePDFSizingProp = React.useMemo(() => {
    if (!pdfDimensions) {
      return {};
    }
    if (
      bounds.height / pdfDimensions.height <
      bounds.width / pdfDimensions.width
    ) {
      return { height: Math.floor(bounds.height * 0.8) };
    }
    return { width: Math.floor(bounds.width * 0.8) };
  }, [bounds, pdfDimensions]);

  return (
    <div className="pdf-preview">
      <div className="asset-preview-mask" ref={wrapperHeightRef}>
        <div className="asset-preview-wrap">
          <div className="asset-preview">
            <Document
              className="document"
              loading={
                <div className="loadingMessage">
                  <LoadingOutlined />
                </div>
              }
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              error={
                <Alert
                  showIcon
                  message="Error"
                  description="An error occurred whilst trying to load the pdf."
                  className="errorMessage"
                  type="error"
                  closable
                  onClose={() => closePreview()}
                />
              }
            >
              <TransformWrapper>
                <TransformComponent>
                  <Page
                    pageNumber={pageNumber}
                    inputRef={previewDivRef}
                    renderMode="svg"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onLoadSuccess={page => {
                      setPdfDimensions({
                        height: page.originalHeight,
                        width: page.originalWidth,
                      });
                    }}
                    {...calculatePDFSizingProp}
                  />
                </TransformComponent>
              </TransformWrapper>
              <div className="page-controls">
                <Button
                  disabled={pageNumber <= 1}
                  onClick={previousPage}
                  icon={<LeftOutlined />}
                  size="large"
                />
                <div className="page-controls__page-number">
                  {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
                </div>
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
    </div>
  );
};

export default PDFViewer;
