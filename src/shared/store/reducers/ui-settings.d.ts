import { UISettingsActions } from '../actions/ui-settings';
import { AnyAction } from 'redux';
export declare const DEFAULT_UI_SETTINGS: {
  pageSizes: {
    orgsListPageSize: number;
    projectsListPageSize: number;
    resourcesListPageSize: number;
    linksListPageSize: number;
  };
};
export interface UISettingsState {
  pageSizes: {
    [key: string]: number;
  };
}
export default function uiSettingsReducer(
  state: UISettingsState | undefined,
  action: UISettingsActions | AnyAction
): UISettingsState;
