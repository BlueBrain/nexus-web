import React from 'react';
import * as pluralize from 'pluralize';
import { isNil } from 'lodash';
import { getTypesTrancated } from '../../shared/molecules/MyDataTable/MyDataTable';
import './styles.less';

interface Props {
  nexusTotal: number;
  totalFiltered?: number;
  totalOnPage: number;
  orgAndProject?: [string, string];
  type?: string;
}

export const DatasetCount: React.FC<Props> = ({
  nexusTotal,
  totalOnPage,
  totalFiltered,
  orgAndProject,
  type,
}: Props) => {
  return (
    <div className="data-explorer-count">
      <span className="total">
        Total:{' '}
        <b>
          {nexusTotal.toLocaleString(`en-US`)}{' '}
          {pluralize('dataset', nexusTotal ?? 0)}
        </b>{' '}
        {orgAndProject && orgAndProject.length === 2 && (
          <span>
            in project{' '}
            <b>
              {orgAndProject[0]}/{orgAndProject[1]}
            </b>
          </span>
        )}{' '}
        {type && (
          <span>
            of type <b>{getTypesTrancated(type).types}</b>
          </span>
        )}
      </span>
      <span className="predicate">
        Sample loaded for review: <b>{totalOnPage}</b>{' '}
        {!isNil(totalFiltered) && (
          <span data-testid="filtered-count">
            of which <b>{totalFiltered}</b> matching filter
          </span>
        )}
      </span>
    </div>
  );
};
