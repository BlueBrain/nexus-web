import * as React from 'react';
import { Dropdown, Input, Icon, Button, Tooltip } from 'antd';
import FilterDropdown from './FilterDropdown';
import { Link } from 'react-router-dom';

interface ListControlPanelProps {
  listIndex: number;
  query: { filters: any; textQuery?: string };
  queryPath: string;
  filterValues: { [key: string]: { key: string; count: number }[] } | {};
  onTextQueryChange: (value?: string) => void;
  onFilterChange: (value: { [key: string]: string }) => void;
  onRefreshList: () => void;
  onClear: () => void;
  onCloneList: () => void;
}

const ListControlPanel: React.FunctionComponent<ListControlPanelProps> = ({
  listIndex,
  query,
  queryPath,
  filterValues,
  onTextQueryChange,
  onFilterChange,
  onRefreshList,
  onClear,
  onCloneList,
}) => {
  const inputEl = React.createRef<Input>();
  const [value, setTextQueryValue] = React.useState(query.textQuery);
  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setTextQueryValue(value);
  };

  const handleInputEnter = () => {
    onTextQueryChange(value);
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
        // onBlur={handleBlurEvent}
        onChange={handleInputChange}
        allowClear={true}
        tabIndex={listIndex + 1}
        addonAfter={
          !!Object.keys(filterValues).length && (
            <Tooltip title="Filter query">
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
      <Tooltip title="Refresh list">
        <Button
          icon="reload"
          onClick={onRefreshList}
          style={{ marginRight: '2px' }}
        />
      </Tooltip>
      <Tooltip title="Clone this query">
        <Button
          icon="switcher"
          onClick={onCloneList}
          style={{ marginRight: '2px' }}
        />
      </Tooltip>
      <Tooltip title="View ElasticSearch query">
        <Link to={queryPath}>
          <Button icon="search" />
        </Link>
      </Tooltip>
    </div>
  );
};

export default ListControlPanel;
