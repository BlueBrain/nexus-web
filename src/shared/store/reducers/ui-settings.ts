import {
  UISettingsActions,
  UISettingsActionTypes,
} from '../actions/ui-settings';
import { AnyAction } from 'redux';

export const DEFAULT_UI_SETTINGS = {
  pageSizes: {
    orgsListPageSize: 5,
    projectsListPageSize: 5,
    resourcesListPageSize: 20,
    linksListPageSize: 10,
  },
};

export interface UISettingsState {
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
      break;
  }
  return state;
}
