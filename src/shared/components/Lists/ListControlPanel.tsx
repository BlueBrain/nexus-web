import * as React from 'react';
import { Dropdown, Menu, Input, Icon, Button, Tooltip } from 'antd';
import FilterDropdown from './FilterDropdown';

interface ListControlPanelProps {
  query: { filters: any; textQuery?: string };
  filterValues: { [key: string]: { key: string; count: number }[] } | {};
  onTextQueryChange: (value?: string) => void;
  onFilterChange: (value: { [key: string]: string }) => void;
  onClear: () => void;
}

const ListControlPanel: React.FunctionComponent<ListControlPanelProps> = ({
  query,
  filterValues,
  onTextQueryChange,
  onFilterChange,
  onClear,
}) => {
  const inputEl = React.useRef(null);
  const [value, setTextQueryValue] = React.useState(query.textQuery);
  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setTextQueryValue(value);
    // if cleared or removed, send changed event
    if (!value) {
      onTextQueryChange(value);
    }
  };

  const handleInputEnter = () => {
    onTextQueryChange(value);
  };

  const handleBlurEvent = (e: any) => {
    const blurValue = e.target.value;
    if (blurValue === query.textQuery) {
      return;
    }
    handleInputEnter();
  };

  const handleFilterUpdate = (value: any) => {
    onFilterChange(value);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Input
        style={{ marginRight: '2px' }}
        value={value}
        ref={inputEl}
        onPressEnter={handleInputEnter}
        onBlur={handleBlurEvent}
        onChange={handleInputChange}
        allowClear={true}
        addonAfter={
          !!Object.keys(filterValues).length && (
            <Tooltip title="Filter list">
              <Dropdown
                overlay={
                  <FilterDropdown
                    query={query}
                    filterValues={filterValues}
                    onFilterChange={handleFilterUpdate}
                  />
                }
                placement="bottomCenter"
              >
                <a className="ant-dropdown-link">
                  <Icon type="filter" onClick={() => {}} />
                </a>
              </Dropdown>
            </Tooltip>
          )
        }
        placeholder="Enter text query..."
      />
      <Tooltip title="Clear filters">
        <Button
          icon="close-circle"
          onClick={onClear}
          style={{ marginRight: '2px' }}
        />
      </Tooltip>
      {/* <Button icon="export" onClick={() => {}} style={{ marginRight: '2px' }} /> */}
      <Tooltip title="Clone list">
        <Button
          icon="switcher"
          onClick={() => {}}
          style={{ marginRight: '2px' }}
        />
      </Tooltip>
      <Tooltip title="View ElasticSearch Query">
        <Button icon="code" onClick={() => {}} />
      </Tooltip>
    </div>
  );
};

export default ListControlPanel;
