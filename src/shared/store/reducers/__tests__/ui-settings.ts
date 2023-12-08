import { UISettingsActions, UISettingsActionTypes } from '../../actions/ui-settings';
import uiSettingsReducer, { DEFAULT_UI_SETTINGS } from '../ui-settings';

describe('UISettings Reducer', () => {
  it('should return default state if no match', () => {
    expect(uiSettingsReducer(undefined, { type: 'SOME_ACTION' })).toEqual(DEFAULT_UI_SETTINGS);
  });

  it('should change the appropriate key using a filterKey in the Action', () => {
    const changeOrgsListAction: UISettingsActions = {
      type: UISettingsActionTypes.CHANGE_PAGE_SIZE,
      filterKey: 'orgsListPageSize',
      payload: { pageSize: 50 },
    };
    expect(uiSettingsReducer(undefined, changeOrgsListAction)).toEqual({
      openCreationPanel: false,
      pageSizes: {
        ...DEFAULT_UI_SETTINGS.pageSizes,
        orgsListPageSize: 50,
      },
      currentResourceView: null,
      isAdvancedModeEnabled: false,
    });
  });
});
