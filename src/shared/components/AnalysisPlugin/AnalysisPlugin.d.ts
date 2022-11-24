import './AnalysisPlugin.less';
import { AnalysisPluginProps } from '../../types/plugins/report';
declare const AnalysisPlugin: ({
  analysisResourceType,
  containerId,
  containerResourceTypes,
  analysisReports,
  onSave,
  onDelete,
  FileUpload,
  imagePreviewScale,
  mode,
  currentlyBeingEditedAnalysisReportDescription,
  currentlyBeingEditedAnalysisReportCategories,
  currentlyBeingEditedAnalysisReportTypes,
  currentlyBeingEditedAnalysisReportId,
  currentlyBeingEditedAnalysisReportName,
  currentlyBeingEditedAnalysisReportTools,
  selectedAssets,
  isUploadAssetDialogOpen,
  dispatch,
  onClickRelatedResource,
}: AnalysisPluginProps) => JSX.Element;
export default AnalysisPlugin;
