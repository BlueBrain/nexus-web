import * as React from 'react';
import { TableColumn } from '../containers/DataTableContainer';
export declare enum ColumnTypes {
  DATE = 'date',
  RESOURCE = 'resource',
  TEXT = 'text',
  URL = 'url',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  IMAGE = 'image',
}
declare const ColumnConfig: React.FC<{
  column: TableColumn;
  onChange: (name: string, data: any) => void;
}>;
export default ColumnConfig;
