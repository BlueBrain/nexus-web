import { AnalysesState } from '../../types/plugins/report';
export declare const analysisUISlice: import('@reduxjs/toolkit').Slice<
  AnalysesState,
  {
    initialize: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => any;
    saveReport: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => void;
    addReport: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>
    ) => any;
    setReportResourceType: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => any;
    editReport: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => any;
    selectAsset: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => void;
    setSelectedReportFirstLoad: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => any;
    changeSelectedReports: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => any;
    changeAnalysisName: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => any;
    changeAnalysisDescription: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => any;
    changeAnalysisCategories: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => any;
    changeAnalysisTypes: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => any;
    changeTools: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => any;
    changeScale: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>,
      action: {
        payload: any;
        type: string;
      }
    ) => any;
    openFileUploadDialog: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>
    ) => any;
    closeFileUploadDialog: (
      state: import('immer/dist/internal').WritableDraft<AnalysesState>
    ) => any;
  },
  'analysisUI'
>;
export declare const setReportResourceType: import('@reduxjs/toolkit').ActionCreatorWithPayload<
    any,
    string
  >,
  editReport: import('@reduxjs/toolkit').ActionCreatorWithPayload<any, string>,
  saveReport: import('@reduxjs/toolkit').ActionCreatorWithPayload<any, string>,
  addReport: import('@reduxjs/toolkit').ActionCreatorWithoutPayload<string>,
  selectAsset: import('@reduxjs/toolkit').ActionCreatorWithPayload<any, string>,
  setSelectedReportFirstLoad: import('@reduxjs/toolkit').ActionCreatorWithPayload<
    any,
    string
  >,
  changeSelectedReports: import('@reduxjs/toolkit').ActionCreatorWithPayload<
    any,
    string
  >,
  changeAnalysisName: import('@reduxjs/toolkit').ActionCreatorWithPayload<
    any,
    string
  >,
  changeAnalysisDescription: import('@reduxjs/toolkit').ActionCreatorWithPayload<
    any,
    string
  >,
  changeAnalysisCategories: import('@reduxjs/toolkit').ActionCreatorWithPayload<
    any,
    string
  >,
  changeAnalysisTypes: import('@reduxjs/toolkit').ActionCreatorWithPayload<
    any,
    string
  >,
  changeTools: import('@reduxjs/toolkit').ActionCreatorWithPayload<any, string>,
  openFileUploadDialog: import('@reduxjs/toolkit').ActionCreatorWithoutPayload<string>,
  closeFileUploadDialog: import('@reduxjs/toolkit').ActionCreatorWithoutPayload<string>,
  changeScale: import('@reduxjs/toolkit').ActionCreatorWithPayload<any, string>,
  initialize: import('@reduxjs/toolkit').ActionCreatorWithPayload<any, string>;
declare const _default: import('@reduxjs/toolkit').Reducer<
  AnalysesState,
  import('@reduxjs/toolkit').AnyAction
>;
export default _default;
