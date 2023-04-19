import { Button, Input, Space } from 'antd';
import { FilterDropdownProps } from 'antd/lib/table/interface';
import React from 'react';

export const ColumnFilterDropDown: (
  props: FilterDropdownProps & { label: string }
) => React.ReactNode = ({
  selectedKeys,
  setSelectedKeys,
  confirm,
  clearFilters,
  label,
}) => {
  return (
    <div style={{ padding: 8, pointerEvents: 'all' }}>
      <Input
        placeholder={`Filter ${label}`}
        value={selectedKeys[0]}
        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => confirm()}
        style={{ marginBottom: 8, display: 'block' }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => confirm()}
          size="small"
          style={{ width: 90 }}
        >
          Filter
        </Button>
        <Button
          onClick={() => {
            clearFilters && clearFilters();
          }}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </Space>
    </div>
  );
};
