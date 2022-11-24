import './NewReportForm.less';
import { NewReportFormProps } from '../../types/plugins/report';
declare const NewReportForm: ({
  analysisReportId,
  dispatch,
  onSave,
  FileUpload,
  imagePreviewScale,
  categories,
  types,
}: NewReportFormProps) => JSX.Element;
export default NewReportForm;
