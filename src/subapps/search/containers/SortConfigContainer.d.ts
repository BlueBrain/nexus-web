import { ESSortField } from '../hooks/useGlobalSearch';
declare type SortConfigProps = {
  sortedFields: ESSortField[];
  onRemoveSort: (sort: ESSortField) => void;
  onChangeSortDirection: (sort: ESSortField) => void;
};
declare const SortConfigContainer: ({
  sortedFields,
  onRemoveSort,
  onChangeSortDirection,
}: SortConfigProps) => JSX.Element;
export default SortConfigContainer;
