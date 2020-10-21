import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Empty, Input, Checkbox } from 'antd';

import ActivityResourceItem from './ActivityResourceItem';

import './ResourcesList.less';

const { Search } = Input;

const ResourcesList: React.FC<{
  resources: Resource[];
  projectLabel: string;
  orgLabel: string;
}> = ({ resources, projectLabel, orgLabel }) => {
  const onSearch = (event: any) => {
    console.log('searching....', event);
  };

  const onChange = (event: any) => {
    console.log('filtering....', event.target.value);
  };

  const filters = [
    { label: 'Code', value: 'code' },
    { label: 'Notes', value: 'notes' },
    { label: 'Input data', value: 'input-data' },
    { label: 'Output data', value: 'output-data' },
  ];

  return (
    <div className="resources-list">
      <div className="resources-list__controls">
        <h3 className="resources-list__group-title">Search</h3>
        <Search
          placeholder="Search by label or description"
          onSearch={onSearch}
        />
        <div className="resources-list__filters">
          <h3 className="resources-list__group-title">Filters</h3>
          {filters.map(filter => (
            <div className="resources-list__filter" key={filter.value}>
              <Checkbox onChange={onChange} value={filter.value}>
                {filter.label}
              </Checkbox>
            </div>
          ))}
        </div>
      </div>
      <div className="resources-list__resources">
        {resources.length > 0 ? (
          resources.map(resource => (
            <ActivityResourceItem
              item={resource}
              key={`resource-item-${resource['@id']}`}
              link={`/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
                resource['@id']
              )}`}
            />
          ))
        ) : (
          <Empty description="No resources found for this Activity" />
        )}
      </div>
    </div>
  );
};

export default ResourcesList;
