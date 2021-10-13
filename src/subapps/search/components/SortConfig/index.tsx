import {
  CloseCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Button, Modal } from 'antd';
import * as React from 'react';
import { SortDirection } from '../../../../shared/hooks/useAccessDataForTable';
import { ESSortField } from '../../hooks/useGlobalSearch';
import './SortConfig.less';

const SortConfig: React.FC<{
  sortedFields: ESSortField[];
  onRemoveSort: (sort: ESSortField) => void;
  onChangeSortDirection: (sort: ESSortField) => void;
}> = ({ sortedFields, onRemoveSort, onChangeSortDirection }) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [isSortModalVisible, setIsSortModalVisible] = React.useState(false);
  const countOfSortedFields = () => sortedFields.length;

  const positionModal = () => {
    const buttonRects = buttonRef.current?.getBoundingClientRect();
    return { top: buttonRects?.bottom, left: buttonRects?.left };
  };

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => setIsSortModalVisible(true)}
        type="link"
      >
        <SortAscendingOutlined />
        {countOfSortedFields() > 0 ? (
          <>
            {` Sorted on ${countOfSortedFields()} ${
              countOfSortedFields() > 1 ? ' columns' : ' column'
            }`}
          </>
        ) : (
          <> No sorting</>
        )}
      </Button>
      <Modal
        visible={isSortModalVisible}
        onCancel={() => setIsSortModalVisible(false)}
        style={{ ...positionModal() }}
        className="sort-modal"
        mask={false}
        footer={null}
        closable={false}
      >
        {countOfSortedFields() === 0 && 'No sorting applied'}
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
                  s.direction === SortDirection.ASCENDING
                    ? 'primary'
                    : 'default'
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
                  s.direction === SortDirection.DESCENDING
                    ? 'primary'
                    : 'default'
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
      </Modal>
    </>
  );
};

export default SortConfig;
