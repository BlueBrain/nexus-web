import { ESSortField } from '../../hooks/useGlobalSearch';
import './SortConfig.less';
declare type SortConfigProps = {
  sortedFields: ESSortField[];
  onRemoveSort: (sort: ESSortField) => void;
  onChangeSortDirection: (sort: ESSortField) => void;
};
declare const SortConfig: ({
  sortedFields,
  onRemoveSort,
  onChangeSortDirection,
}: SortConfigProps) => JSX.Element;
export default SortConfig;
