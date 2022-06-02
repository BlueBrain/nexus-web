import {
  CloseCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { SortDirection } from '../../../../shared/hooks/useAccessDataForTable';
import { ESSortField } from '../../hooks/useGlobalSearch';
import './SortConfig.less';

type SortConfigProps = {
  sortedFields: ESSortField[];
  onRemoveSort: (sort: ESSortField) => void;
  onChangeSortDirection: (sort: ESSortField) => void;
};

const SortConfig = ({
  sortedFields,
  onRemoveSort,
  onChangeSortDirection,
}: SortConfigProps) => {
  const countOfSortedFields = sortedFields.length;

  return (
    <>
      {countOfSortedFields === 0 && 'No sorting applied'}
      {sortedFields.map((s, ix) => (
        <div key={`${ix}-sort`} className="sort">
          <div className="sort__remove">
            <Button type="text" onClick={() => onRemoveSort(s)}>
              <CloseCircleOutlined />
            </Button>
            {ix === 0 ? 'Sort By' : 'then by'}
          </div>
          <div className="sort__field-name">{s.label}</div>
          <div className="sort__direction">
            <Button
              type={
                s.direction === SortDirection.ASCENDING ? 'primary' : 'default'
              }
              shape="round"
              icon={<SortAscendingOutlined />}
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
              type={
                s.direction === SortDirection.DESCENDING ? 'primary' : 'default'
              }
              shape="round"
              icon={<SortDescendingOutlined />}
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
    </>
  );
};

export default SortConfig;
