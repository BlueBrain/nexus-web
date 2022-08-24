import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Asset } from '../../types/plugins/report';
import { AnalysesState } from '../../types/plugins/report';
import { findIndex, remove, slice } from 'lodash';
const DEFAULT_SCALE = 50;

interface Analyses {
  mode: 'view' | 'edit' | 'create';
  analysisResourceType: 'report_container' | 'individual_report';
  hasInitializedSelectedReports: boolean;
  selectedAnalysisReports: AnalysisReport[];
  imagePreviewScale: number;
}
const initialState: AnalysesState = {
  mode: 'view',
  analysisResourceType: 'report_container',
  hasInitializedSelectedReports: true,
  selectedAnalysisReports: [],
  selectedAssets: [],
  imagePreviewScale: DEFAULT_SCALE,
};

interface AnalysisReport {
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
}
function updateObject(oldObject: any, newValues: any) {
  return Object.assign({}, oldObject, newValues);
}
const AnalysisReporAdaptet = createEntityAdapter<AnalysisReport>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const AssetAdaptert = createEntityAdapter<Asset>({
  selectId: asset => asset.id,
});
const newReport = {
  mode: 'create',
  currentlyBeingEditingAnalysisReportName: '',
  currentlyBeingEditedAnalysisReportDescription: '',
  currentlyBeingEditedAnalysisReportCategories: [],
  currentlyBeingEditedAnalysisReportTypes: [],
};

const analysisUISlice = createSlice({
  name: 'analysisUI',
  initialState,
  reducers: {
    initialize: (state, action) =>
      updateObject(state, {
        mode: 'view',
        analysisResourceType: 'report_container',
        hasInitializedSelectedReports: true,
        selectedAnalysisReports: action.payload.analysisReportId,
        imagePreviewScale: action.payload.scale,
      }),
    saveReport: (state, action) =>
      updateObject(state, { ...{ mode: 'view' }, ...action.payload }),
    addReport: state => updateObject(state, newReport),
    setReportResourceType: (state, action) =>
      updateObject(state, {
        analysisResourceType: action.payload.resourceType,
        containerId: action.payload.containerId,
        containerName: action.payload.containerName,
      }),
    editReport: (state, action) =>
      updateObject(state, {
        mode: 'edit',
        selectedAnalysisReports: [action.payload.analysisId],
        currentlyBeingEditedAnalysisReportId: action.payload.analysisId,
        currentlyBeingEditingAnalysisReportName: action.payload.analaysisName,
        currentlyBeingEditedAnalysisReportDescription:
          action.payload.analysisDescription,
      }),
    selectAsset: (state, action) => {
      state.selectedAssets = state.selectedAssets ? state.selectedAssets : [];
      const selectId = findIndex(state.selectedAssets, action.payload.assetId);

      selectId
        ? slice(state.selectedAssets, selectId, selectId + 1)
        : state.selectedAssets.push(action.payload.assetId);
      return state;
    },
    setSelectedReportFirstLoad: (state, action) =>
      updateObject(state, {
        selectedAnalysisReports:
          action.payload && action.payload.analysisReportId !== ''
            ? [action.payload.analysisReportId]
            : [],
        hasInitializedSelectedReports: true,
      }),
    changeSelectedReports: (state, action) =>
      (state.selectedAnalysisReports = action.payload.analysisReportId),
    changeAnalysisName: (state, action) =>
      (state.currentlyBeingEditingAnalysisReportName = action.payload.name),
    changeAnalysisDescription: (state, action) =>
      (state.currentlyBeingEditedAnalysisReportDescription =
        action.payload.description),
    changeAnalysisCategories: (state, action) =>
      (state.currentlyBeingEditedAnalysisReportCategories =
        action.payload.categories),
    changeAnalysisTypes: (state, action) =>
      (state.currentlyBeingEditedAnalysisReportTypes = action.payload.types),
    changeScale: (state, action) => (state.imagePreviewScale = action.payload),
    openFileUploadDialog: state =>
      updateObject(state, { isUploadAssetDialogOpen: true }),
    closeFileUploadDialog: state =>
      updateObject(state, { isUploadAssetDialogOpen: false }),
  },
});

export const {
  setReportResourceType,
  editReport,
  saveReport,
  addReport,
  selectAsset,
  setSelectedReportFirstLoad,
  changeSelectedReports,
  changeAnalysisName,
  changeAnalysisDescription,
  changeAnalysisCategories,
  changeAnalysisTypes,
  openFileUploadDialog,
  closeFileUploadDialog,
  changeScale,
  initialize,
} = analysisUISlice.actions;

export default analysisUISlice.reducer;
