import * as React from 'react';
import { List } from 'antd';
import ResourceListItem, { ResourceListItemProps } from './ResourceListItem';

import './Resources.less';

export interface ResourceListProps {
  resources: ResourceListItemProps[];
  loading?: boolean;
}

const DEFAULT_PAGE_SIZE = 20;

const ResourceList: React.SFC<ResourceListProps> = ({
  resources,
  loading = false,
}) => {
  // const [{}, setItems] = React.useState(resources);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const filtered = orgs.filter(org =>
  //     org.name.toLocaleLowerCase().includes(e.target.value.toLocaleLowerCase())
  //   );
  //   setItems(filtered);
  // };

  return (
    <div className="ResourceList">
      <p className="result" />
      <div className="resources">
        <List
          loading={loading}
          header={`Found ${resources.length} resource${resources.length > 1 &&
            's'}`}
          dataSource={resources}
          pagination={{
            onChange: page => {
              console.log(page);
            },
            pageSize: DEFAULT_PAGE_SIZE,
          }}
          renderItem={(resource: ResourceListItemProps) => (
            <ResourceListItem key={resource.id} {...resource} />
          )}
        />
      </div>
    </div>
  );
};

export default ResourceList;
