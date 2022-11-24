import * as React from 'react';
import { FilterState, SearchConfigField } from '../../hooks/useGlobalSearch';
import './FiltersConfig.less';
declare const FiltersConfig: React.FC<{
  onRemoveFilter: (filter: FilterState) => void;
  filters: FilterState[];
  columns: SearchConfigField;
}>;
export default FiltersConfig;
