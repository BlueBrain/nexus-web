import './Studio.scss';

import { Spin } from 'antd';
import * as React from 'react';

import ListItem from '../../../shared/components/List/Item';

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
  makeResourceUri(resourceId: string): string;
}> = ({ studios, busy, makeResourceUri }) => {
  return (
    <Spin spinning={busy}>
      {studios.map(studio => {
        return (
          <a href={makeResourceUri(studio.id)} key={studio.id} role="link">
            <ListItem key={studio.id}>
              <StudioItem {...studio} />
            </ListItem>
          </a>
        );
      })}
    </Spin>
  );
};

export default StudioList;
