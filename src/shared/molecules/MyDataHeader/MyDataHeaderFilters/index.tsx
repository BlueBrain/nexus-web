import pluralize from 'pluralize';
import TypeSelector from '../../TypeSelector/TypeSelector';
import DateSelector from './DateSelector';
import DateFieldSelector from './DateFieldSelector';
import PageTitle from './PageTitle';
import IssuerSelector from './IssuerSelector';
import SearchInput from './SearchInput';
import {
  THeaderFilterProps,
  THeaderTitleProps,
} from '../../../canvas/MyData/types';

const MyDataHeaderTitle = ({
  total,
  query,
  setFilterOptions,
  locate,
  issuer,
}: THeaderTitleProps) => {
  return (
    <div className="my-data-header-title">
      <div className="left">
        <PageTitle
          text="My data"
          label={pluralize('Dataset', Number(total))}
          total={total}
        />
        <IssuerSelector {...{ issuer, setFilterOptions }} />
      </div>
      <div className="right">
        <SearchInput {...{ query, locate, setFilterOptions }} />
      </div>
    </div>
  );
};

const MyDataHeaderFilters = ({
  types,
  typeOperator,
  dateField,
  setFilterOptions,
}: THeaderFilterProps) => {
  return (
    <div className="my-data-header-actions">
      <span className="filter-heading">Filter: </span>
      <DateFieldSelector {...{ dateField, setFilterOptions }} />
      <DateSelector {...{ dateField, setFilterOptions }} />
      <TypeSelector
        key={'my-data-type-selector'}
        {...{
          types,
          typeOperator,
          updateOptions: setFilterOptions,
          styles: {
            container: { width: '300px' },
          },
        }}
      />
    </div>
  );
};

export { MyDataHeaderFilters, MyDataHeaderTitle };
