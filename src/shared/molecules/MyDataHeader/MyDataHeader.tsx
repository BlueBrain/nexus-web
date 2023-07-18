import * as React from 'react';
import { THeaderProps } from '../../../shared/canvas/MyData/types';
import { MyDataHeaderTitle, MyDataHeaderFilters } from './MyDataHeaderFilters';
import './styles.less';

const MyDataHeader: React.FC<THeaderProps> = ({
  total,
  types,
  dateField,
  query,
  setFilterOptions,
  locate,
  issuer,
}) => {
  return (
    <div className="my-data-header">
      <MyDataHeaderTitle
        {...{
          total,
          query,
          setFilterOptions,
          locate,
          issuer,
        }}
      />
      <div className="divider" />
      <MyDataHeaderFilters
        {...{
          types,
          dateField,
          query,
          locate,
          setFilterOptions,
          issuer,
        }}
      />
    </div>
  );
};

export default MyDataHeader;
