import { Resource, View, NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
export declare const EXPORT_CSV_FILENAME = 'nexus-query-result.csv';
export declare const CSV_MEDIATYPE = 'text/csv';
import { Projection } from '../components/EditTableForm';
export declare type TableResource = Resource<{
  '@type': string;
  name: string;
  description: string;
  tableOf?: {
    '@id': string;
  };
  view: string;
  projection?: Projection;
  enableSearch: boolean;
  enableInteractiveRows: boolean;
  enableDownload: boolean;
  enableSave: boolean;
  resultsPerPage: number;
  dataQuery: string;
  configuration: TableColumn | TableColumn[];
}>;
export declare type TableColumn = {
  '@type': string;
  name: string;
  format: string;
  enableSearch: boolean;
  enableSort: boolean;
  enableFilter: boolean;
};
export declare enum SortDirection {
  DESCENDING = 'desc',
  ASCENDING = 'asc',
}
export declare type TableSort = {
  key: string;
  direction: SortDirection;
};
export declare const DEFAULT_FIELDS: (
  | {
      title: string;
      dataIndex: string;
      key: string;
      displayIndex: number;
      render: (value: string) => string | JSX.Element;
      sortable?: undefined;
    }
  | {
      title: string;
      dataIndex: string;
      sortable: boolean;
      key: string;
      displayIndex: number;
      render?: undefined;
    }
)[];
export declare function querySparql(
  nexus: NexusClient,
  dataQuery: string,
  view: View,
  hasProjection: boolean,
  projectionId?: string
): Promise<{
  headerProperties: {
    title: string;
    dataIndex: string;
  }[];
  items: {
    id: string;
    self: {
      dataType?: string | undefined;
      type: string;
      value: string;
    };
    key: string;
  }[];
  total: number;
}>;
export declare function parseESResults(
  result: any
): {
  total: any;
  items: any;
};
export declare const queryES: (
  query: Object,
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  viewId: string,
  hasProjection: boolean,
  projectionId?: string | undefined,
  sort?: TableSort | undefined
) => Promise<any>;
export declare const useAccessDataForTable: (
  orgLabel: string,
  projectLabel: string,
  tableResourceId: string,
  tableResource?:
    | Resource<{
        [key: string]: any;
      }>
    | undefined
) => {
  downloadCSV: () => void;
  addToDataCart: () => void;
  addFromDataCart: () => void;
  onSelect: (selectedRowKeys: React.Key[], selectedRows: Resource[]) => void;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  tableResult: import('react-query/types/').QueryObserverResult<any, Error>;
  dataResult: import('react-query/types/').QueryObserverResult<any, Error>;
};
