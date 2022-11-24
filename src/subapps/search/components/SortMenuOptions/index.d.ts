import * as React from 'react';
import { ESSortField } from '../../hooks/useGlobalSearch';
import './SortMenuOptions.less';
export declare enum SortDirection {
  DESCENDING = 'desc',
  ASCENDING = 'asc',
}
declare const SortMenuOptions: React.FC<{
  sortField?: ESSortField;
  disabled: boolean;
  onSortField: (sortOption: SortDirection) => void;
  onRemoveSort: (sortOption: ESSortField) => void;
}>;
export default SortMenuOptions;
