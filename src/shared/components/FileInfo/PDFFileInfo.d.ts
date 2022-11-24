declare type PDFPreviewProps = {
  src?: string;
  onSave: (name: string, description: string) => void;
  text?: string;
  title?: string;
  lastUpdated?: string;
  lastUpdatedBy?: string;
  previewDisabled: boolean;
};
declare const _default: ({
  src,
  onSave,
  text,
  title,
  lastUpdated,
  lastUpdatedBy,
  previewDisabled,
}: PDFPreviewProps) => JSX.Element;
export default _default;
