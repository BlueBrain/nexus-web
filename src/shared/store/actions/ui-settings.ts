import { FilterPayloadAction } from './utils';

export enum UISettingsActionTypes {
  CHANGE_PAGE_SIZE = 'CHANGE_PAGE_SIZE',
}

type ChangePageSizeAction = FilterPayloadAction<
  UISettingsActionTypes.CHANGE_PAGE_SIZE,
  { pageSize: number }
>;

export type UISettingsActions = ChangePageSizeAction;
