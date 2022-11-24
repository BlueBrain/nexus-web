import * as React from 'react';
import {
  fieldVisibilityActionType,
  FieldsVisibilityState,
} from '../../hooks/useGlobalSearch';
import './ColumnsVisibility.less';
export declare type ColumnVisibility = {
  key: string;
  name: string;
  visible: boolean;
};
declare const ColumnsVisibilityConfig: React.FunctionComponent<{
  columnsVisibility: FieldsVisibilityState;
  dispatchFieldVisibility: React.Dispatch<fieldVisibilityActionType>;
}>;
export default ColumnsVisibilityConfig;
