import { Resource } from '@bbp/nexus-sdk';
import { AnyAction } from 'redux';
import {
  UISettingsActions,
  UISettingsActionTypes,
} from '../actions/ui-settings';
import { TDELink } from './data-explorer';

export const editorPopoverResolvedDataInitialValue = {
  top: 0,
  left: 0,
  open: false,
  results: [],
  error: null,
  resolvedAs: undefined,
};
export const DEFAULT_UI_SETTINGS: UISettingsState = {
  openCreationPanel: false,
  pageSizes: {
    orgsListPageSize: 5,
    projectsListPageSize: 5,
    resourcesListPageSize: 20,
    linksListPageSize: 10,
  },
  currentResourceView: null,
  editorPopoverResolvedData: editorPopoverResolvedDataInitialValue,
};
export type TEditorPopoverResolvedAs =
  | 'resource'
  | 'resources'
  | 'external'
  | 'error'
  | undefined;
export type TEditorPopoverResolvedData = {
  open: boolean;
  top: number;
  left: number;
  results?: TDELink | TDELink[];
  resolvedAs: TEditorPopoverResolvedAs;
  error?: any;
};
export interface UISettingsState {
  openCreationPanel: boolean;
  pageSizes: { [key: string]: number };
  currentResourceView: Resource | null;
  editorPopoverResolvedData: TEditorPopoverResolvedData;
}

export default function uiSettingsReducer(
  state: UISettingsState = DEFAULT_UI_SETTINGS,
  action: UISettingsActions | AnyAction
) {
  switch (action.type) {
    case UISettingsActionTypes.CHANGE_PAGE_SIZE:
      return {
        ...state,
        pageSizes: {
          ...state.pageSizes,
          [action.filterKey]: action.payload.pageSize,
        },
      };
    case UISettingsActionTypes.CHANGE_HEADER_CREATION_PANEL: {
      return {
        ...state,
        openCreationPanel: action.payload ?? !state.openCreationPanel,
      };
    }
    case UISettingsActionTypes.UPDATE_CURRENT_RESOURCE_VIEW: {
      return {
        ...state,
        currentResourceView: action.payload,
      };
    }
    case UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER: {
      return {
        ...state,
        editorPopoverResolvedData: {
          ...state.editorPopoverResolvedData,
          open: action.payload.open,
          top: action.payload.top,
          left: action.payload.left,
          results: action.payload.results,
          error: action.payload.error,
          resolvedAs: action.payload.resolvedAs,
        },
      };
    }
    default:
      return state;
  }
}
