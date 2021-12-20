import { Select } from 'antd';
import * as React from 'react';
import { SearchLayout } from '../../hooks/useGlobalSearch';

const SearchLayouts: React.FC<{
  layouts?: SearchLayout[];
  selectedLayout?: string;
  onChangeLayout: (layout: string) => void;
}> = ({ layouts, onChangeLayout, selectedLayout }) => {
  return (
    <>
      <Select
        style={{ width: '100px' }}
        onChange={layout => onChangeLayout(layout as string)}
        value={selectedLayout}
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
