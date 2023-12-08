import { Resource } from '@bbp/nexus-sdk/es';
import { AnyAction } from 'redux';

import {
  UISettingsActions,
  UISettingsActionTypes,
} from '../actions/ui-settings';

export const DEFAULT_UI_SETTINGS: UISettingsState = {
  openCreationPanel: false,
  pageSizes: {
    orgsListPageSize: 5,
    projectsListPageSize: 5,
    resourcesListPageSize: 20,
    linksListPageSize: 10,
  },
  currentResourceView: null,
  isAdvancedModeEnabled: false,
};

export interface UISettingsState {
  openCreationPanel: boolean;
  pageSizes: { [key: string]: number };
  currentResourceView: Resource | null;
  isAdvancedModeEnabled: boolean;
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
    case UISettingsActionTypes.ENABLE_ADVANCED_MODE: {
      return {
        ...state,
        isAdvancedModeEnabled: action.payload ?? !state.isAdvancedModeEnabled,
      };
    }
    default:
      return state;
  }
}
