import * as React from 'react';
import { Empty, Input, Checkbox } from 'antd';

const { Search } = Input;

import './ResourcesSearch.less';

const ResourcesSearch: React.FC<{
  onChangeType: (types: any[]) => void;
  onSearchByText: (text: string) => void;
}> = ({ onChangeType, onSearchByText }) => {
  const filters = [
    { label: 'Code', value: 'SoftwareSourceCode' },
    { label: 'Notes', value: 'FusionNote' },
    { label: 'Input data', value: 'input-data' },
    { label: 'Output data', value: 'output-data' },
    { label: 'Agent', value: 'Agent' },
  ];

  return (
    <div className="resources-search__controls">
      <h3 className="resources-search__group-title">Search</h3>
      <Search
        placeholder="Search by label or description"
        onSearch={onSearchByText}
      />
      <div className="resources-search__filters">
        <h3 className="resources-search__group-title">Filters</h3>
        <Checkbox.Group onChange={onChangeType}>
          {filters.map(filter => (
            <div className="resources-search__filter" key={filter.value}>
              <Checkbox value={filter.value}>{filter.label}</Checkbox>
            </div>
          ))}
        </Checkbox.Group>
      </div>
    </div>
  );
};

export default ResourcesSearch;
