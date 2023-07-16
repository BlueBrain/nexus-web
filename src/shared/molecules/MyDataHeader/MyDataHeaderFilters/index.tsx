import TypeSelector from './TypeSelector';
import DateSelector from './DateSelector';
import IssuerSelector from './IssuerSelector';
import DateFieldSelector from './DateFieldSelector';
import SearchInput from './SearchInput';
import { THeaderFilterProps } from '../../../canvas/MyData/types';

const MyDataHeaderFilters = ({
  types,
  dateField,
  query,
  locate,
  issuer,
  setFilterOptions,
}: THeaderFilterProps) => {
  return (
    <div className="my-data-table-header-actions">
      <IssuerSelector {...{ issuer, setFilterOptions }} />
      <DateFieldSelector {...{ dateField, setFilterOptions }} />
      <DateSelector {...{ dateField, setFilterOptions }} />
      <TypeSelector {...{ types, setFilterOptions }} />
      <SearchInput {...{ query, locate, setFilterOptions }} />
    </div>
  );
};

export default MyDataHeaderFilters;
