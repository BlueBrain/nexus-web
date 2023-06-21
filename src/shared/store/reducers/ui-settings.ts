import { Resource } from '@bbp/nexus-sdk';
import { AnyAction } from 'redux';
import {
  UISettingsActions,
  UISettingsActionTypes,
} from '../actions/ui-settings';

export const DEFAULT_UI_SETTINGS = {
  openCreationPanel: false,
  pageSizes: {
    orgsListPageSize: 5,
    projectsListPageSize: 5,
    resourcesListPageSize: 20,
    linksListPageSize: 10,
  },
  currentResourceView: null,
  urlEditorPopover: {
    top: 0,
    left: 0,
    open: false,
    urls: [],
  },
};

type TEditorURL = {
  url: string;
  project: string;
};
export interface UISettingsState {
  openCreationPanel: boolean;
  pageSizes: { [key: string]: number };
  currentResourceView: Resource | null;
  urlEditorPopover: {
    top: number;
    left: number;
    open: boolean;
    urls: string | TEditorURL[];
  };
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
        urlEditorPopover: {
          ...state.urlEditorPopover,
          top: action.payload.top ?? state.urlEditorPopover.top,
          left: action.payload.left ?? state.urlEditorPopover.left,
          open: action.payload.open ?? state.urlEditorPopover.open,
          urls: action.payload.urls ?? state.urlEditorPopover.urls,
        },
      };
    }
    default:
      return state;
  }
}
