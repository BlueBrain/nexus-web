import {
  CloseCircleOutlined,
  ConsoleSqlOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import * as React from 'react';
import { SortDirection } from '../../../hooks/useSearchQuery';
import { ESSortField } from '../../hooks/useGlobalSearch';

import './SortMenuOptions.less';

const SortMenuOptions: React.FC<{
  sortField?: ESSortField;
  disabled: boolean;
  onSortField: (sortOption: SortDirection) => void;
  onRemoveSort: (sortOption: ESSortField) => void;
}> = ({ sortField, disabled, onSortField, onRemoveSort }) => {
  return (
    <div className="sort-menu-options">
      <Button
        disabled={disabled}
        className="sort-menu-options__sort-button"
        type={
          sortField?.direction === SortDirection.ASCENDING
            ? 'primary'
            : 'default'
        }
        shape="round"
        icon={<SortAscendingOutlined />}
        size="small"
        onClick={() => onSortField(SortDirection.ASCENDING)}
      >
        Ascending
      </Button>{' '}
      <Button
        disabled={disabled}
        className="sort-menu-options__sort-button"
        type={
          sortField?.direction === SortDirection.DESCENDING
            ? 'primary'
            : 'default'
        }
        shape="round"
        icon={<SortDescendingOutlined />}
        size="small"
        onClick={() => onSortField(SortDirection.DESCENDING)}
      >
        Descending
      </Button>
      {sortField && (
        <Button
          disabled={disabled}
          type="text"
          shape="round"
          icon={<CloseCircleOutlined />}
          size="small"
          onClick={() => onRemoveSort(sortField)}
        >
          Clear
        </Button>
      )}
    </div>
  );
};

export default SortMenuOptions;
