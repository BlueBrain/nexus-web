import pluralize from 'pluralize';

import { THeaderFilterProps, THeaderTitleProps } from '../../../canvas/MyData/types';
import TypeSelector from '../../TypeSelector/TypeSelector';
import DateFieldSelector from './DateFieldSelector';
import DateSelector from './DateSelector';
import IssuerSelector from './IssuerSelector';
import PageTitle from './PageTitle';
import SearchInput from './SearchInput';

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
        <PageTitle text="My data" label={pluralize('Dataset', Number(total))} total={total} />
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
  issuer,
}: THeaderFilterProps) => {
  return (
    <div className="my-data-header-actions" id="my-data-header-actions">
      <span className="filter-heading">Filter: </span>
      <DateFieldSelector {...{ dateField, setFilterOptions }} />
      <DateSelector {...{ dateField, setFilterOptions }} />
      <TypeSelector
        key={'my-data-type-selector'}
        {...{
          issuer,
          types,
          typeOperator,
          updateOptions: setFilterOptions,
          styles: {
            container: { width: '300px' },
          },
        }}
        popupContainer={() => document.getElementById('my-data-header-actions')!}
      />
    </div>
  );
};

export { MyDataHeaderFilters, MyDataHeaderTitle };
