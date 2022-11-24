import { Resource } from '@bbp/nexus-sdk';
import * as React from 'react';
import '../styles/data-table.less';
import { Projection } from '../components/EditTableForm';
export declare type TableColumn = {
  '@type': string;
  name: string;
  format: string;
  enableSearch: boolean;
  enableSort: boolean;
  enableFilter: boolean;
};
export declare type TableResource = Resource<{
  '@id': string;
  '@type': string;
  name: string;
  description: string;
  tableOf?: {
    '@id': string;
  };
  view: string;
  projection: Projection;
  enableSearch: boolean;
  enableInteractiveRows: boolean;
  enableDownload: boolean;
  enableSave: boolean;
  resultsPerPage: number;
  dataQuery: string;
  configuration: TableColumn | TableColumn[];
}>;
export declare type UnsavedTableResource = {
  '@type': 'FusionTable';
  '@context': string;
  name: string;
  description: string;
  tableOf?: {
    '@id': string;
  };
  view: string;
  projection: Projection;
  enableSearch: boolean;
  enableInteractiveRows: boolean;
  enableDownload: boolean;
  enableSave: boolean;
  resultsPerPage: number;
  dataQuery: string;
  configuration: TableColumn | TableColumn[];
};
declare type DataTableProps = {
  orgLabel: string;
  projectLabel: string;
  tableResourceId: string;
  onDeprecate?: () => void;
  onSave?: (data: TableResource | UnsavedTableResource) => void;
  options: {
    disableDelete: boolean;
    disableAddFromCart: boolean;
    disableEdit: boolean;
  };
  showEdit?: boolean;
  toggledEdit?: (show: boolean) => void;
};
declare const DataTableContainer: React.FC<DataTableProps>;
export default DataTableContainer;
