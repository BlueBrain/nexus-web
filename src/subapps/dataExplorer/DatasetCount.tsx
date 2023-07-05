import React from 'react';
import * as pluralize from 'pluralize';
import { isNil } from 'lodash';
import './styles.less';

interface Props {
  nexusTotal: number;
  totalFiltered?: number;
  totalOnPage: number;
}

export const DatasetCount: React.FC<Props> = ({
  nexusTotal,
  totalOnPage,
  totalFiltered,
}: Props) => {
  return (
    <div className="data-explorer-count">
      <span>
        Total:{' '}
        <b>
          {nexusTotal.toLocaleString(`en-US`)}{' '}
          {pluralize('dataset', nexusTotal ?? 0)}
        </b>{' '}
      </span>

      <span>
        Sample loaded for review: <b>{totalOnPage}</b>
      </span>

      {!isNil(totalFiltered) && (
        <span>
          Filtered: <b>{totalFiltered}</b>
        </span>
      )}
    </div>
  );
};
