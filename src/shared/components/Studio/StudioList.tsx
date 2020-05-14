import * as React from 'react';
import { Spin } from 'antd';

import ListItem from '../List/Item';
import InfiniteSearch from '../List/InfiniteSearch';

import './Studio.less';

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
  error?: Error | null;
  goToStudio?(studioId: string): void;
  createStudioButton?: React.ReactElement;
  onLoadMore({ searchValue }: { searchValue: string }): void;
  makeResourceUri(resourceId: string): string;
  total: number;
  searchQuery: string;
}> = ({
  studios,
  busy,
  error,
  goToStudio = () => {},
  createStudioButton = null,
  onLoadMore,
  makeResourceUri,
  total,
  searchQuery,
}) => {
  const hasMore = studios.length < Number(total || 0);
  return (
    <div className="studio-list">
      <Spin spinning={busy}>
        {createStudioButton}
        <br />
        <InfiniteSearch
          dataLength={studios.length}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          defaultSearchValue={searchQuery}
        >
          {studios.map(studio => {
            return (
              <a
                href={makeResourceUri(studio.id)}
                key={studio.id}
                onClick={e => {
                  e.preventDefault();
                  goToStudio(studio.id);
                }}
              >
                <ListItem key={studio.id}>
                  <StudioItem {...studio} />
                </ListItem>
              </a>
            );
          })}
        </InfiniteSearch>
      </Spin>
    </div>
  );
};

export default StudioList;
