import {
  createSlice,
  createEntityAdapter,
  CaseReducer,
  createReducer,
  PayloadAction,
} from '@reduxjs/toolkit';
import { AnalysesState, Asset } from '../../types/plugins/report';
import {
  findIndex,
  slice,
  zipObject,
  mapKeys,
  capitalize,
  assign,
} from 'lodash';
import { DEFAULT_SCALE } from '../../../constants';

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
  console.log('OBJECT UPDATE, newVAlues');
  console.log(newValues);
  return Object.assign({}, oldObject, newValues);
}

const newReport = {
  mode: 'create',
  currentlyBeingEditedAnalysisReportName: '',
  currentlyBeingEditedAnalysisReportDescription: '',
  currentlyBeingEditedAnalysisReportCategories: [],
  currentlyBeingEditedAnalysisReportTypes: [],
};

export const analysisUISlice = createSlice({
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
    saveReport: (state, action) => {
      const mapp = mapKeys(
        action.payload,
        (v, k) => `currentlyBeingEditedAnalysisReport${capitalize(k)}`
      );
      console.log('SAVE REPORT', action.payload, mapp);
      updateObject(state, action.payload);
    },
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
        currentlyBeingEditedAnalysisReportName: action.payload.analaysisName,
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
      updateObject(state, {
        mode: 'view',
        selectedAnalysisReports: action.payload.analysisReportIds,
      }),
    changeAnalysisName: (state, action) =>
      updateObject(state, {
        currentlyBeingEditedAnalysisReportName: action.payload.name,
      }),
    changeAnalysisDescription: (state, action) =>
      updateObject(state, {
        currentlyBeingEditedAnalysisReportDescription: action.payload.name,
      }),
    changeAnalysisCategories: (state, action) =>
      updateObject(state, {
        currentlyBeingEditedAnalysisReportCategories: action.payload.categories,
      }),
    changeAnalysisTypes: (state, action) =>
      updateObject(state, {
        currentlyBeingEditedAnalysisReportTypes: action.payload.types,
      }),
    changeScale: (state, action) =>
      updateObject(state, { imagePreviewScale: action.payload }),
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
