import './SortConfig.scss';

import {
  CloseCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';

import { SortDirection } from '../../../../shared/hooks/useAccessDataForTable';
import { ESSortField } from '../../hooks/useGlobalSearch';

type SortConfigProps = {
  sortedFields: ESSortField[];
  onRemoveSort: (sort: ESSortField) => void;
  onChangeSortDirection: (sort: ESSortField) => void;
};

const SortConfig = ({ sortedFields, onRemoveSort, onChangeSortDirection }: SortConfigProps) => {
  const countOfSortedFields = sortedFields.length;

  return (
    <>
      {countOfSortedFields === 0 && 'No sorting applied'}
      <div role="list">
        {sortedFields.map((s, ix) => (
          <div
            key={`${ix}-sort`}
            className="sort"
            role="listitem"
            aria-label={`Sorted By ${s.label} in ${
              s.direction === SortDirection.ASCENDING ? 'ascending' : 'descending'
            } order`}
          >
            <div className="sort__remove">
              <Button type="text" onClick={() => onRemoveSort(s)} aria-label="Remove Sort Criteria">
                <CloseCircleOutlined aria-hidden="true" />
              </Button>
              <span aria-hidden="true">{ix === 0 ? 'Sort By' : 'then by'}</span>
            </div>
            <div className="sort__field-name" aria-hidden={true}>
              {s.label}
            </div>
            <div className="sort__direction">
              <Button
                type={s.direction === SortDirection.ASCENDING ? 'primary' : 'default'}
                shape="round"
                icon={<SortAscendingOutlined aria-hidden="true" />}
                aria-label="Sort in Ascending Order"
                size="small"
                onClick={() =>
                  onChangeSortDirection({
                    ...s,
                    direction: SortDirection.ASCENDING,
                  })
                }
              >
                Sort Asc
              </Button>
              <Button
                type={s.direction === SortDirection.DESCENDING ? 'primary' : 'default'}
                shape="round"
                icon={<SortDescendingOutlined aria-label="Sort in Descending Order" />}
                aria-label="Sort in Descending Order"
                size="small"
                onClick={() =>
                  onChangeSortDirection({
                    ...s,
                    direction: SortDirection.DESCENDING,
                  })
                }
              >
                Sort Desc
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SortConfig;
