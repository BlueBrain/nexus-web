import * as React from 'react';

import InfiniteSearch from '../List/InfiniteSearch';
import ListItem from '../List/Item';

import './Studio.less';
import { Empty, Spin } from 'antd';

type StudioItemProps = {
  id: string;
  name: string;
  description?: string;
};

const StudioItem: React.FC<StudioItemProps> = ({ name, description }) => {
  return (
    <div className="studio-item">
      <p className="label">{name}</p>
      {description && <p className="description">{description}</p>}
    </div>
  );
};

const StudioList: React.FC<{
  studios: StudioItemProps[];
  busy?: boolean;
  goToStudio?(studioId: string): void;
}> = ({ studios, busy, goToStudio = () => {} }) => {
  const noStudios = studios.length === 0;
  return (
    <div className="studio-list">
      <h3>Studios</h3>
      <Spin spinning={busy}>
        {noStudios && <Empty description="No studios available" />}
        {!noStudios && (
          <InfiniteSearch
            dataLength={studios.length}
            hasMore={false}
            onLoadMore={() => {}}
            hasSearch={false}
          >
            {studios.map(studio => (
              <ListItem onClick={() => goToStudio(studio.id)} key={studio.id}>
                <StudioItem {...studio} />
              </ListItem>
            ))}
          </InfiniteSearch>
        )}
      </Spin>
    </div>
  );
};

export default StudioList;
