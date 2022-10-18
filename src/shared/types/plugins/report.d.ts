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
  currentlyBeingEditedAnalysisReportTools?: {
    scriptPath: string;
    description: string;
  }[];
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
  analysis_report_id: string;
  analysis_report_name: string;
  analysis_report_description: string;
  analysis_report_categories: string;
  analysis_report_types: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
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

export interface PersonContribution {
  '@type': 'Contribution';
  agent:
    | { '@type': ['Person', 'Agent']; '@id'?: string }
    | { '@type': ['Person', 'Agent']; '@id'?: string }[];
}

export interface SoftwareContribution {
  '@type': 'Contribution';
  agent:
    | { '@type': ['Software', 'Agent'] }
    | { '@type': ['Software', 'Agent'] }[];
  repository: string;
  description: string;
}

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
  updatedBy?: string;
  updatedAt?: string;
  contribution?: (SoftwareContribution | PersonContribution)[];
  revision?: number;
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
    types?: string[],
    scripts?: { scriptPath: string; description: string }[]
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
  currentlyBeingEditedAnalysisReportTools?: {
    scriptPath: string;
    description: string;
  }[];
  selectedAssets?: string[];
  isUploadAssetDialogOpen?: boolean;
  dispatch: (params: any) => void;
};

export type TypeWidgetProps = {
  allTypes: { label: string; description: string }[];
  availableTypes?: { label: string; description: string }[];
  mode: 'view' | 'edit' | 'create';
  selectedTypes: string[];
  toggleSelectType: (value: string) => void;
};

export type TypeEditWidgetProps = {
  currentlyBeingEditedAnalysisReportTypes?: string[];
  dispatch: (params: any) => void;
};
export type CategoryEditWidgetProps = {
  currentlyBeingEditedAnalysisReportCategories?: string[];
  dispatch: (params: any) => void;
};

export type ReportGeneration = {
  scriptPath: string;
  description: string;
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
    types?: string[],
    scripts?: ReportGeneration[]
  ) => void;
  dispatch: (params: any) => void;
};

export type ReportAssetProps = {
  analysisReport: AnalysisReport;
  mode: 'view' | 'edit' | 'create';
  selectedAssets?: string[];
  imagePreviewScale: number;
  currentlyBeingEditedAnalysisReportId?: string;
  dispatch: (params: any) => void;
};
