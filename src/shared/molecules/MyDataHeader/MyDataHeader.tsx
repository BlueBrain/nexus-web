import * as React from 'react';
import * as pluralize from 'pluralize';
import { THeaderProps, TTitleProps } from '../../../shared/canvas/MyData/types';
import MyDataHeaderFilters from './MyDataHeaderFilters';
import { prettifyNumber } from '../../../utils/formatNumber';
import './styles.less';

const Title = ({ text, label, total }: TTitleProps) => {
  return (
    <div className="my-data-table-header-title">
      <span>{text}</span>
      <span>{total ? `${prettifyNumber(total)} ${label}` : ''}</span>
    </div>
  );
};

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
    <div className="my-data-table-header">
      <Title
        text="My data"
        label={pluralize('Dataset', Number(total))}
        total={total}
      />
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
