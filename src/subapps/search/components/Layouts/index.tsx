import { TableOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import * as React from 'react';
import { SearchLayout } from '../../hooks/useGlobalSearch';
import './SearchLayouts.less';

const SearchLayouts: React.FC<{
  layouts?: SearchLayout[];
  selectedLayout?: string;
  onChangeLayout: (layout: string) => void;
}> = ({ layouts, onChangeLayout, selectedLayout }) => {
  return (
    <>
      <Select
        suffixIcon={<TableOutlined />}
        onChange={layout => onChangeLayout(layout as string)}
        value={selectedLayout}
        dropdownMatchSelectWidth={false}
        className="search-layout"
      >
        {layouts?.map(layout => {
          return (
            <Select.Option key={layout.name} value={layout.name}>
              {layout.name}
            </Select.Option>
          );
        })}
      </Select>
    </>
  );
};

export default SearchLayouts;
