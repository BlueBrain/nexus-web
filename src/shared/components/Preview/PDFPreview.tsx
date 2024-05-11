import * as React from 'react';
import { Alert, Button } from 'antd';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = 'public/pdf.worker.min.js';
import './PDFThumbnail.less';
import './PDFPreview.less';
import {
  CloseOutlined,
  EyeOutlined,
  LeftOutlined,
  LoadingOutlined,
  RightOutlined,
} from '@ant-design/icons';
import useMeasure from '../../hooks/useMeasure';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

type PDFThumbnailProps = {
  url: string;
  onPreview: () => void;
  previewDisabled: boolean;
};

const PDFThumbnail = ({
  url,
  onPreview,
  previewDisabled,
}: PDFThumbnailProps) => {
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
    <div className="pdf-thumbnail-wrapper" ref={wrapperHeightRef}>
      <Document
        loading={<>loading...</>}
        file={url}
        onLoadError={console.error}
        renderMode="svg"
        options={{ isEvalSupported: false }}
      >
        <Page
          className="pdf-thumbnail-page"
          pageNumber={1}
          renderMode="svg"
          onLoadSuccess={page => {
            setPdfDimensions({
              height: page.originalHeight,
              width: page.originalWidth,
            });
          }}
          {...calculatePDFSizingProp}
        >
          {!previewDisabled && (
            <div className="ant-image-mask" onClick={() => onPreview()}>
              <div className="ant-image-mask-info">
                <EyeOutlined />
                Preview
              </div>
            </div>
          )}
        </Page>
      </Document>
    </div>
  );
};

const PDFViewer: React.FC<{
  url: string;
  closePreview: () => void;
}> = ({ url, closePreview }) => {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pageNumber, setPageNumber] = React.useState<number>(1);

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
      <div className="asset-preview-mask">
        <div className="asset-preview-wrap">
          <div className="asset-preview" ref={wrapperHeightRef}>
            <div className="asset-preview-close">
              <button
                className="asset-preview-close__button"
                onClick={() => closePreview()}
              >
                <CloseOutlined />
              </button>
            </div>
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

export { PDFViewer as default, PDFThumbnail };
