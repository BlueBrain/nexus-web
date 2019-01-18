import * as React from 'react';
import { Dropdown, Menu, Input, Icon, Button } from 'antd';
import FilterDropdown from './FilterDropdown';

interface ListControlPanelProps {
  query: { filters: any; textQuery?: string };
  onTextQueryChange: (value: string) => void;
}

const ListControlPanel: React.FunctionComponent<ListControlPanelProps> = ({
  query,
  onTextQueryChange,
}) => {
  const inputEl = React.useRef(null);
  const [value, setTextQueryValue] = React.useState(query.textQuery);
  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setTextQueryValue(value);
  };

  const handleInputEnter = () => {
    if (value) {
      onTextQueryChange(value);
    }
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
        onChange={handleInputChange}
        addonAfter={
          <Dropdown overlay={<FilterDropdown />} placement="bottomCenter">
            <a className="ant-dropdown-link">
              <Icon type="filter" onClick={() => {}} />
            </a>
          </Dropdown>
        }
        placeholder="Enter text query..."
      />
      <Button icon="export" onClick={() => {}} style={{ marginRight: '2px' }} />
      <Button
        icon="switcher"
        onClick={() => {}}
        style={{ marginRight: '2px' }}
      />
      <Button icon="code" onClick={() => {}} />
    </div>
  );
};

export default ListControlPanel;
