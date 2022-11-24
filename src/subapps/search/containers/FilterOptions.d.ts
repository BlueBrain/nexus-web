import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { FilterState } from '../hooks/useGlobalSearch';
import './FilterOptions.less';
declare type ConfigField =
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
    }
  | {
      name: string;
      label: string;
      format: string;
      array: boolean;
      optional: boolean;
      fields?: undefined;
    };
export declare const extractFieldName: (filterKeyword: string) => string;
export declare const createKeyWord: (field: ConfigField) => string;
declare const FilterOptions: React.FC<{
  field: ConfigField;
  onFinish: (values: any) => void;
  nexusClient: NexusClient;
  filter: FilterState[];
  query: string;
}>;
export default FilterOptions;
