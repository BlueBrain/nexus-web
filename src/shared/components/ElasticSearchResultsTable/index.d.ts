import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { TablePaginationConfig } from 'antd/lib/table';
import { UseSearchProps, UseSearchResponse } from '../../hooks/useSearchQuery';
import { TableRowSelection } from 'antd/lib/table/interface';
import { ResultTableFields } from '../../types/search';
import './../../styles/result-table.less';
export interface ResultsGridProps {
  rowSelection?: TableRowSelection<any>;
  pagination: TablePaginationConfig;
  searchResponse: UseSearchResponse;
  fields: ResultTableFields[];
  isStudio?: boolean;
  onClickItem: (resource: Resource) => void;
  onSort?: (sort?: UseSearchProps['sort']) => void;
}
export declare const DEFAULT_FIELDS: (
  | {
      title: string;
      dataIndex: string;
      key: string;
      displayIndex: number;
      sortable?: undefined;
    }
  | {
      title: string;
      dataIndex: string;
      sortable: boolean;
      key: string;
      displayIndex: number;
    }
)[];
declare const ElasticSearchResultsTable: React.FC<ResultsGridProps>;
export default ElasticSearchResultsTable;
