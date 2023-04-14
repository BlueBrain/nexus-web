import {
  UISettingsActions,
  UISettingsActionTypes,
} from '../actions/ui-settings';
import { AnyAction } from 'redux';

export const DEFAULT_UI_SETTINGS = {
  openCreationPanel: false,
  pageSizes: {
    orgsListPageSize: 5,
    projectsListPageSize: 5,
    resourcesListPageSize: 20,
    linksListPageSize: 10,
  },
};

export interface UISettingsState {
  openCreationPanel: boolean;
  pageSizes: { [key: string]: number };
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
    default:
      return state;
  }
}
