import { FilterPayloadAction } from './utils';
export declare enum UISettingsActionTypes {
  CHANGE_PAGE_SIZE = 'CHANGE_PAGE_SIZE',
}
declare type ChangePageSizeAction = FilterPayloadAction<
  UISettingsActionTypes.CHANGE_PAGE_SIZE,
  {
    pageSize: number;
  }
>;
export declare type UISettingsActions = ChangePageSizeAction;
export {};
