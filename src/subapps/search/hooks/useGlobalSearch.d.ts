import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import '../containers/SearchContainer.less';
import { SortDirection } from '../../../shared/hooks/useAccessDataForTable';
export declare type SearchConfigField =
  | {
      title: () => JSX.Element;
      dataIndex: string;
      key: string;
      render: (value: any) => JSX.Element | '';
      label: string;
    }[]
  | undefined;
declare type actionType =
  | {
      type: 'add' | 'remove';
      payload: FilterState;
    }
  | {
      type: 'fromLayout';
      payload: FilterState[];
    };
export declare type FilterState = {
  filters: string[];
  filterType: 'anyof' | 'allof' | 'date' | 'missing';
  filterTerm: string;
};
export declare type FieldVisibility = {
  key: string;
  name: string;
  visible: boolean;
};
export declare type FieldsVisibilityState = {
  isPersistent: boolean;
  fields: FieldVisibility[];
};
declare type fieldVisibilityInitializeActionType = {
  type: 'initialize';
  payload: FieldVisibility[];
};
declare type fieldVisibilityReOrderType = {
  type: 'reOrder';
  payload: FieldVisibility[];
};
declare type fieldVisibilityUpdateActionType = {
  type: 'update';
  payload: FieldVisibility;
};
declare type fieldVisibilitySetAllVisibleActionType = {
  type: 'setAllVisible';
};
declare type fieldVisibilityFromLayout = {
  type: 'fromLayout';
  payload: FieldVisibility[];
};
export declare type fieldVisibilityActionType =
  | fieldVisibilityInitializeActionType
  | fieldVisibilityReOrderType
  | fieldVisibilityUpdateActionType
  | fieldVisibilitySetAllVisibleActionType
  | fieldVisibilityFromLayout;
export declare type ConfigField =
  | {
      name: string;
      label: string;
      array: boolean;
      optional: boolean;
      fields: {
        name: string;
        format: string;
      }[];
      format?: undefined;
      filterable: boolean;
      sortable: boolean;
    }
  | {
      name: string;
      label: string;
      format: string;
      array: boolean;
      optional: boolean;
      fields?: undefined;
      filterable: boolean;
      sortable: boolean;
    };
export declare type SearchLayout = {
  name: string;
  visibleFields: string[];
  filters: {
    field: string;
    operator: 'and' | 'or' | 'none' | 'missing';
    values: string[];
  }[];
  sort: {
    field: string;
    order: 'asc' | 'desc';
  }[];
};
declare type SearchConfig = {
  fields: ConfigField[];
  layouts: SearchLayout[];
};
export declare type ESSortField = {
  label: string;
  term: string;
  fieldName: string;
  direction: SortDirection;
  format?: string;
};
declare function useGlobalSearchData(
  query: string,
  page: number,
  pageSize: number,
  onSuccess: (queryResponse: any) => void,
  onSortOptionsChanged: () => void,
  nexus: NexusClient
): {
  isLoading: boolean;
  searchError: Error | null;
  columns: SearchConfigField;
  data: any;
  dispatchFilter: React.Dispatch<actionType>;
  fieldsVisibilityState: FieldsVisibilityState;
  visibleColumns: SearchConfigField;
  filterState: FilterState[];
  sortState: ESSortField[];
  removeSortOption: (sortFieldOption: ESSortField) => void;
  changeSortOption: (sortFieldOption: ESSortField) => void;
  resetAll: () => void;
  dispatchFieldVisibility: React.Dispatch<fieldVisibilityActionType>;
  config: SearchConfig | undefined;
  handleChangeSearchLayout: (layoutName: string) => void;
  selectedSearchLayout: string | undefined;
};
export default useGlobalSearchData;
