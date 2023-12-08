import { SortAscendingOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import * as React from 'react';

import SortConfig from '../components/SortConfig';
import { ESSortField } from '../hooks/useGlobalSearch';

type SortConfigProps = {
  sortedFields: ESSortField[];
  onRemoveSort: (sort: ESSortField) => void;
  onChangeSortDirection: (sort: ESSortField) => void;
};

const SortConfigContainer = ({
  sortedFields,
  onRemoveSort,
  onChangeSortDirection,
}: SortConfigProps) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [isSortModalVisible, setIsSortModalVisible] = React.useState(false);
  const countOfSortedFields = () => sortedFields.length;
  const positionModal = () => {
    const buttonRects = buttonRef.current?.getBoundingClientRect();
    return { top: buttonRects?.bottom, left: buttonRects?.left };
  };

  return (
    <>
      <Button ref={buttonRef} onClick={() => setIsSortModalVisible(true)} type="link">
        <SortAscendingOutlined />
        {countOfSortedFields() > 0 ? (
          <>
            {` Sorted on ${countOfSortedFields()} ${
              countOfSortedFields() > 1 ? 'columns' : 'column'
            }`}
          </>
        ) : (
          <> No sorting</>
        )}
      </Button>
      <Modal
        open={isSortModalVisible}
        onCancel={() => setIsSortModalVisible(false)}
        style={{ ...positionModal() }}
        className="sort-modal"
        mask={false}
        footer={null}
        closable={false}
      >
        <SortConfig
          sortedFields={sortedFields}
          onChangeSortDirection={onChangeSortDirection}
          onRemoveSort={onRemoveSort}
        />
      </Modal>
    </>
  );
};

export default SortConfigContainer;
