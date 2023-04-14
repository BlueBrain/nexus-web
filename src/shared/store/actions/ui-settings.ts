import { FilterPayloadAction } from './utils';

export enum UISettingsActionTypes {
  CHANGE_PAGE_SIZE = 'CHANGE_PAGE_SIZE',
  CHANGE_HEADER_CREATION_PANEL = 'CHANGE_HEADER_CREATION_PANEL',
}

type ChangePageSizeAction = FilterPayloadAction<
  UISettingsActionTypes.CHANGE_PAGE_SIZE,
  { pageSize: number }
>;

export type UISettingsActions = ChangePageSizeAction;
