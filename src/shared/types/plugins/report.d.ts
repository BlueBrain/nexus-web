export type AnalysesState = {
  analysisResourceType: 'report_container' | 'individual_report';
  containerId?: string;
  containerName?: string;
  containerType?: string;
  imagePreviewScale: number;
  mode: 'view' | 'edit' | 'create';
  hasInitializedSelectedReports: boolean;
  selectedAnalysisReports?: string[];
  currentlyBeingEditedAnalysisReportId?: string;
  currentlyBeingEditedAnalysisReportName?: string;
  currentlyBeingEditedAnalysisReportCategories?: string[];
  currentlyBeingEditedAnalysisReportTypes?: string[];
  currentlyBeingEditedAnalysisReportDescription?: string;
  selectedAssets?: string[];
  isUploadAssetDialogOpen?: boolean;
};

export type AnalysisPluginContainerProps = {
  orgLabel: string;
  projectLabel: string;
  resourceId: string;
};

export type AnalysisAssetSparqlQueryRowResult = {
  id: string;
  key: string;
  container_resource_id: string;
  container_resource_name: string;
  container_resource_type: string;
  analysis_report_id: string;
  analysis_report_name: string;
  analysis_report_description: string;
  analysis_report_categories: string[];
  analysis_report_types: string[];
  created_by: string;
  created_at: string;
  asset_name: string;
  asset_description: string;
  asset_content_url: string;
  asset_encoding_format: string;
  self: {
    type: string;
    value: string;
  };
};

export type Asset = {
  analysisReportId?: string;
  saved: boolean;
  id: string;
  name: string;
  description?: string;
  encodingFormat: string;
  contentSize?: {
    unitCode: 'bytes';
    value: number;
  };
  digest?: {
    algorithm: string;
    value: string;
  };
  filePath: string;
  filename?: string;
  lastUpdated?: string;
  lastUpdatedBy?: string;
  deprecated?: boolean;
  preview: ({ mode }: { mode: 'view' | 'edit' }) => React.ReactElement;
};

export type AnalysisReport = {
  id?: string;
  containerId?: string;
  containerName?: string;
  types?: string[];
  categories?: string[];
  name: string;
  type?: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  assets: Asset[];
};

export type AnalysisPluginProps = {
  analysisResourceType: 'report_container' | 'individual_report';
  containerId?: string;
  containerName?: string;
  analysisReports: AnalysisReport[];
  FileUpload: (analysisReportId?: string) => JSX.Element;
  onSave: (
    name: string,
    description?: string,
    id?: string,
    categories?: string[],
    types?: string[]
  ) => void;
  onDelete: () => void;
  onCancel: () => void;
  onClickRelatedResource: (resourceId: string) => void;
  imagePreviewScale: number;
  mode: 'view' | 'edit' | 'create';
  selectedAnalysisReports?: string[];
  currentlyBeingEditedAnalysisReportId?: string;
  currentlyBeingEditedAnalysisReportName?: string;
  currentlyBeingEditedAnalysisReportDescription?: string;
  currentlyBeingEditedAnalysisReportCategories?: string[];
  currentlyBeingEditedAnalysisReportTypes?: string[];
  selectedAssets?: string[];
  isUploadAssetDialogOpen?: boolean;
  dispatch: (params: any) => void;
};

export type TypeWidgetProps = {
  analysisReports?: AnalysisReport[];
  mode: 'view' | 'edit' | 'create';
  selectedTypes: string[];
  selectType: (value: string) => void;
  dispatch: (params: any) => void;
};

export type CategoryWidgetProps = {
  analysisReports?: AnalysisReport[];
  mode: 'view' | 'edit' | 'create';
  selectedCategories: string[];
  selectCategory: (value: string) => void;
  dispatch: (params: any) => void;
};

export type NewReportFormProps = {
  analysisReportId?: string | undefined;
  imagePreviewScale?: number;
  FileUpload: () => JSX.Element;
  onSave: (
    name: string,
    description?: string,
    id?: string,
    categories?: string[],
    types?: string[]
  ) => void;
  dispatch: (params: any) => void;
};
