import './FileInfo.less';
declare type FileInfoProps = {
  text: string;
  title: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  onSave: (title: string, text: string) => void;
};
declare const FileInfo: ({
  text,
  title,
  lastUpdated,
  lastUpdatedBy,
  onSave,
}: FileInfoProps) => JSX.Element;
export default FileInfo;
