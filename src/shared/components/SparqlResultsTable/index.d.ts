import * as React from 'react';
import './../../styles/result-table.less';
export declare type HeaderProperties = {
  title: string;
  dataIndex: string;
}[];
export declare type ResultTableProps = {
  headerProperties?: HeaderProperties;
  items: {
    id: string;
    [dataIndex: string]: any;
  }[];
  pageSize?: number;
  handleClick: (self: string) => void;
  tableLabel?: string;
};
declare const SparqlResultsTable: React.FunctionComponent<ResultTableProps>;
export default SparqlResultsTable;
