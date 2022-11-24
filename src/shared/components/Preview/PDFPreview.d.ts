import * as React from 'react';
import './PDFThumbnail.less';
import './PDFPreview.less';
declare type PDFThumbnailProps = {
  url: string;
  onPreview: () => void;
  previewDisabled: boolean;
};
declare const PDFThumbnail: ({
  url,
  onPreview,
  previewDisabled,
}: PDFThumbnailProps) => JSX.Element;
declare const PDFViewer: React.FC<{
  url: string;
  closePreview: () => void;
}>;
export { PDFViewer as default, PDFThumbnail };
