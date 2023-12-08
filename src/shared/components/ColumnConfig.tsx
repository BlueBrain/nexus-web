import { Checkbox, Col, Row, Select } from 'antd';
import * as React from 'react';

import { TableColumn } from '../containers/DataTableContainer';

export enum ColumnTypes {
  DATE = 'date',
  RESOURCE = 'resource',
  TEXT = 'text',
  URL = 'url',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  IMAGE = 'image',
}

const { Option } = Select;

const ColumnConfig: React.FC<{
  column: TableColumn;
  onChange: (name: string, data: any) => void;
}> = ({ column, onChange }) => {
  const [enableSearch, setEnableSeacrh] = React.useState<boolean>(
    column.enableSearch
  );
  const [enableSort, setEnableSort] = React.useState<boolean>(
    column.enableSort
  );
  const [enableFilter, setEnableFilter] = React.useState<boolean>(
    column.enableFilter
  );
  const [type, setType] = React.useState<string>(column.format);

  const onChangeType = (value: string) => {
    setType(value);
    onChange(column.name, { format: value });
  };

  const onChangeEnableSearch = () => {
    const newValue = !enableSearch;

    setEnableSeacrh(newValue);
    onChange(column.name, { enableSearch: newValue });
  };

  const onChangeEnableSort = () => {
    const newValue = !enableSort;

    setEnableSort(!enableSort);
    onChange(column.name, { enableSort: newValue });
  };

  const onChangeEnableFilter = () => {
    const newValue = !enableFilter;

    setEnableFilter(newValue);
    onChange(column.name, { enableFilter: newValue });
  };

  return (
    <div className="edit-table-form__column" key={`column-${column.name}`}>
      <Row style={{ margin: '15px 0' }}>
        <Col xs={8} sm={8} md={8}>
          <h4>{column.name}</h4>
          <Checkbox onChange={onChangeEnableSearch} checked={enableSearch}>
            Enable Search
          </Checkbox>
          <br />
          <Checkbox onChange={onChangeEnableSort} checked={enableSort}>
            Enable Sort
          </Checkbox>
          <br />
          <Checkbox onChange={onChangeEnableFilter} checked={enableFilter}>
            Enable Filter
          </Checkbox>
        </Col>
        <Col xs={4} sm={4} md={4}>
          <p>Column Type</p>
        </Col>
        <Col xs={12} sm={12} md={12}>
          <Select value={type} style={{ width: 120 }} onChange={onChangeType}>
            {Object.values(ColumnTypes).map(type => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default ColumnConfig;
